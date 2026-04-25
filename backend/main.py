from __future__ import annotations

import datetime
import json
import os
import uuid

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from ai import analyze_journal, generate_future_self_letter
from database import engine, get_db
from models import Base, JournalEntry
from transcribe import transcribe_audio

Base.metadata.create_all(bind=engine)

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
async def future_self_reflection(payload: dict):
    question = (payload.get("question") or "").strip()
    future_self_type = (payload.get("futureSelfType") or "").strip()
    journal_summary = (payload.get("journalSummary") or "").strip()
    pattern = (payload.get("patternDetected") or "").strip()

    letter = await generate_future_self_letter(
        future_self_type=future_self_type,
        question=question,
        journal_summary=journal_summary,
        pattern=pattern,
    )
    return {"letter": letter, "futureSelfType": future_self_type}

