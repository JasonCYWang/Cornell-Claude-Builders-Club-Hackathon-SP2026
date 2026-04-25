from __future__ import annotations

import datetime
import json
import os
import uuid

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from ai import (
    analyze_journal,
    detect_delusion,
    evaluate_future_approval,
    generate_future_self_letter,
)
from database import engine, get_db
from models import Base, JournalEntry, UserProfile
from transcribe import transcribe_audio

Base.metadata.create_all(bind=engine)

# Lightweight SQLite migration for hackathon iteration.
try:
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE user_profile ADD COLUMN questionnaire_json TEXT"
            )
        )
except Exception:
    # Column probably already exists (or table doesn't exist yet).
    pass

app = FastAPI(title="FutureMirror API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def create_journal_entry(
    *,
    db: Session,
    entry_id: str,
    duration: str,
    transcript: str,
    note: str | None,
    audio_url: str | None,
    ai: dict,
) -> JournalEntry:
    now = datetime.datetime.utcnow()
    entry = JournalEntry(
        id=entry_id,
        date=now,
        date_key=now.strftime("%Y-%m-%d"),
        duration=duration,
        audio_url=audio_url,
        transcript=transcript,
        note=note,
        mood=ai["mood"],
        mood_label=ai["moodLabel"],
        mood_color=ai["moodColor"],
        summary=ai["summary"],
        emotional_themes=json.dumps(ai["emotionalThemes"]),
        pattern_detected=ai["patternDetected"],
        next_question=ai.get("nextQuestion"),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def entry_to_dict(e: JournalEntry) -> dict:
    try:
        themes = json.loads(e.emotional_themes or "[]")
        if not isinstance(themes, list):
            themes = []
    except Exception:
        themes = []
    return {
        "id": e.id,
        "date": e.date.isoformat(),
        "dateKey": e.date_key,
        "duration": e.duration,
        "audioUrl": e.audio_url,
        "transcript": e.transcript,
        "summary": e.summary,
        "mood": e.mood,
        "moodLabel": e.mood_label,
        "moodColor": e.mood_color,
        "emotionalThemes": themes,
        "patternDetected": e.pattern_detected,
        "nextQuestion": e.next_question,
    }

def profile_to_dict(p: UserProfile) -> dict:
    focus_areas: list[str] = []
    if p.focus:
        try:
            parsed = json.loads(p.focus)
            if isinstance(parsed, list):
                focus_areas = [str(x) for x in parsed if str(x).strip()]
        except Exception:
            pass
    questionnaire: dict = {}
    if getattr(p, "questionnaire_json", None):
        try:
            parsed = json.loads(p.questionnaire_json or "{}")
            if isinstance(parsed, dict):
                questionnaire = parsed
        except Exception:
            pass

    return {
        "firstName": p.first_name or "",
        "lifeStage": p.life_stage or "",
        "focusAreas": focus_areas,
        "questionnaire": questionnaire,
    }


@app.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    row = db.query(UserProfile).filter(UserProfile.id == "me").first()
    if not row:
        return {"firstName": "", "lifeStage": "", "focusAreas": []}
    return profile_to_dict(row)


@app.post("/profile")
def upsert_profile(payload: dict, db: Session = Depends(get_db)):
    first_name = (payload.get("firstName") or "").strip() or None
    life_stage = (payload.get("lifeStage") or "").strip() or None
    focus_areas = payload.get("focusAreas") or []
    if not isinstance(focus_areas, list):
        focus_areas = []
    focus_areas = [str(x).strip() for x in focus_areas if str(x).strip()]

    row = db.query(UserProfile).filter(UserProfile.id == "me").first()
    if not row:
        row = UserProfile(id="me")
        db.add(row)
    row.first_name = first_name
    row.life_stage = life_stage
    row.focus = json.dumps(focus_areas)
    # Store the full questionnaire answers so future-self can use them.
    try:
        row.questionnaire_json = json.dumps(payload)
    except Exception:
        row.questionnaire_json = None
    row.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(row)
    return profile_to_dict(row)


@app.post("/journal/upload")
async def upload_journal(
    audio: UploadFile = File(...),
    duration: str = Form("0:00"),
    note: str | None = Form(None),
    db: Session = Depends(get_db),
):
    file_id = str(uuid.uuid4())
    audio_path = os.path.join(UPLOAD_DIR, f"{file_id}.webm")

    audio_bytes = await audio.read()
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)

    transcript = transcribe_audio(audio_path)
    ai = await analyze_journal(transcript, note or "")

    entry = create_journal_entry(
        db=db,
        entry_id=file_id,
        duration=duration,
        transcript=transcript,
        note=note,
        audio_url=audio_path,
        ai=ai,
    )
    return entry_to_dict(entry)


@app.post("/journal/text")
async def create_text_journal(payload: dict, db: Session = Depends(get_db)):
    transcript = (payload.get("transcript") or "").strip()
    note = payload.get("note")
    if isinstance(note, str):
        note = note.strip() or None
    else:
        note = None
    duration = (payload.get("duration") or "0:00").strip() or "0:00"

    if not transcript:
        raise HTTPException(status_code=400, detail="transcript is required")

    entry_id = str(uuid.uuid4())
    ai = await analyze_journal(transcript, note or "")
    entry = create_journal_entry(
        db=db,
        entry_id=entry_id,
        duration=duration,
        transcript=transcript,
        note=note,
        audio_url=None,
        ai=ai,
    )
    return entry_to_dict(entry)


@app.get("/journal/entries")
def get_entries(db: Session = Depends(get_db)):
    rows = db.query(JournalEntry).order_by(JournalEntry.date.desc()).all()
    return [entry_to_dict(r) for r in rows]


@app.get("/journal/entries/by-date/{date_key}")
def get_entries_by_date(date_key: str, db: Session = Depends(get_db)):
    rows = (
        db.query(JournalEntry)
        .filter(JournalEntry.date_key == date_key)
        .order_by(JournalEntry.date.desc())
        .all()
    )
    return [entry_to_dict(r) for r in rows]


@app.delete("/journal/entries/{entry_id}")
def delete_entry(entry_id: str, db: Session = Depends(get_db)):
    row = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if row:
        db.delete(row)
        db.commit()
    return {"deleted": True}


@app.get("/journal/calendar-summary")
def calendar_summary(db: Session = Depends(get_db)):
    rows = (
        db.query(
            JournalEntry.date_key,
            JournalEntry.mood,
            JournalEntry.mood_color,
            func.count(JournalEntry.id).label("count"),
        )
        .group_by(JournalEntry.date_key)
        .all()
    )
    return {
        r.date_key: {"count": r.count, "mood": r.mood, "moodColor": r.mood_color} for r in rows
    }


@app.post("/future-self/reflection")
async def future_self_reflection(payload: dict, db: Session = Depends(get_db)):
    question = (payload.get("question") or "").strip()
    future_self_type = (payload.get("futureSelfType") or "").strip()
    journal_summary = (payload.get("journalSummary") or "").strip()
    pattern = (payload.get("patternDetected") or "").strip()
    roast_mode = bool(payload.get("roastMode"))
    reality_check = bool(payload.get("realityCheck"))

    profile_row = db.query(UserProfile).filter(UserProfile.id == "me").first()
    profile_ctx = ""
    if profile_row:
        p = profile_to_dict(profile_row)
        bits: list[str] = []
        if p.get("firstName"):
            bits.append(f"Name: {p['firstName']}")
        if p.get("lifeStage"):
            bits.append(f"Life stage: {p['lifeStage']}")
        if p.get("focusAreas"):
            bits.append("Focus areas: " + ", ".join(p["focusAreas"]))
        q = p.get("questionnaire") or {}
        if isinstance(q, dict):
            mood = (q.get("mood") or "").strip()
            biggest_stress = (q.get("biggestStress") or "").strip()
            reflection_frequency = (q.get("reflectionFrequency") or "").strip()
            one_year = (q.get("oneYearVision") or "").strip()
            five_year = (q.get("fiveYearVision") or "").strip()
            more_of = (q.get("moreOf") or "").strip()
            future_feeling = (q.get("futureSelfFeeling") or "").strip()
            if mood:
                bits.append(f"Mood: {mood}")
            if biggest_stress:
                bits.append(f"Biggest stress: {biggest_stress}")
            if reflection_frequency:
                bits.append(f"Reflection frequency: {reflection_frequency}")
            if more_of:
                bits.append(f"Wants more of: {more_of}")
            if future_feeling:
                bits.append(f"Wants future self to feel: {future_feeling}")
            if one_year:
                bits.append(f"1-year vision: {one_year}")
            if five_year:
                bits.append(f"5-year vision: {five_year}")
        if bits:
            profile_ctx = " | ".join(bits)

    # Pull recent journal entries to provide real background context.
    # Keep this bounded so we don't blow token limits.
    recent = (
        db.query(JournalEntry)
        .order_by(JournalEntry.date.desc())
        .limit(10)
        .all()
    )
    recent = list(reversed(recent))  # oldest -> newest
    journal_background_lines: list[str] = []
    for e in recent:
        date_str = e.date.isoformat() if e.date else e.date_key
        transcript = (e.transcript or "").strip()
        note = (e.note or "").strip()
        if transcript:
            journal_background_lines.append(f"- {date_str}: {transcript}")
        if note:
            journal_background_lines.append(f"  Note: {note}")
    journal_background = "\n".join(journal_background_lines).strip()

    # If Gemini isn't configured (or errors), `generate_future_self_letter` returns
    # a built-in fallback letter. We also return `source` so the frontend can tell.
    letter = await generate_future_self_letter(
        future_self_type=future_self_type,
        question=question,
        journal_summary=journal_summary,
        pattern=pattern,
        journal_background=journal_background,
        profile_context=profile_ctx,
        roast_mode=roast_mode,
        reality_check=reality_check,
    )
    is_fallback = letter.startswith("There’s a quiet loop in what you wrote")
    return {
        "letter": letter,
        "futureSelfType": future_self_type,
        "source": "fallback" if is_fallback else "gemini",
    }


@app.post("/future-self/approve")
async def future_self_approve(payload: dict):
    question = (payload.get("question") or "").strip()
    context = (payload.get("context") or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="question is required")
    result = await evaluate_future_approval(question, context)
    return result


@app.post("/future-self/delusion")
async def future_self_delusion(payload: dict):
    statement = (payload.get("statement") or "").strip()
    if not statement:
        raise HTTPException(status_code=400, detail="statement is required")
    result = await detect_delusion(statement)
    return result

