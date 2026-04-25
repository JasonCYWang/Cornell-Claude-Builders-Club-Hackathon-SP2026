from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ai import summarize_and_detect, transcribe_audio
from database import (
    delete_journal_entry,
    get_journal_entry,
    init_db,
    insert_journal_entry,
    list_journal_entries,
    row_to_frontend_shape,
)
from models import FutureSelfRequest, FutureSelfResponse, JournalEntryOut, iso_now
from ai import future_self_reflection


load_dotenv()

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="FutureMirror Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
def _startup() -> None:
    init_db()


def _base_url() -> str:
    return os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")


def _guess_duration_seconds(file_path: Path) -> str:
    # Placeholder: duration should ideally be computed from audio metadata.
    # For now, return a stable-looking mock duration.
    return "01:42"


@app.post("/journal/upload", response_model=JournalEntryOut)
async def upload_journal_audio(file: UploadFile = File(...)):
    """
    Accepts multipart/form-data with `file` and produces a saved journal entry.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    entry_id = str(uuid.uuid4())
    created_at = iso_now()

    ext = Path(file.filename).suffix or ".webm"
    safe_name = f"{entry_id}{ext}"
    dest_path = UPLOAD_DIR / safe_name

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty upload")

    dest_path.write_bytes(contents)

    transcript = await transcribe_audio(str(dest_path))
    summary, emotion, themes, pattern = summarize_and_detect(transcript)

    duration = _guess_duration_seconds(dest_path)

    insert_journal_entry(
        id=entry_id,
        created_at=created_at,
        duration=duration,
        audio_path=f"uploads/{safe_name}",
        transcript=transcript,
        summary=summary,
        emotion=emotion,
        emotional_themes=themes,
        pattern_detected=pattern,
    )

    row = get_journal_entry(entry_id)
    if not row:
        raise HTTPException(status_code=500, detail="Failed to save journal entry")

    shaped = row_to_frontend_shape(row, base_url=_base_url())
    return JournalEntryOut(**shaped)


@app.get("/journal/entries", response_model=List[JournalEntryOut])
def get_entries():
    rows = list_journal_entries()
    base_url = _base_url()
    return [JournalEntryOut(**row_to_frontend_shape(r, base_url=base_url)) for r in rows]


@app.get("/journal/entries/{id}", response_model=JournalEntryOut)
def get_entry(id: str):
    row = get_journal_entry(id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return JournalEntryOut(**row_to_frontend_shape(row, base_url=_base_url()))


@app.delete("/journal/entries/{id}")
def delete_entry(id: str):
    row = get_journal_entry(id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    deleted = delete_journal_entry(id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete")

    # Best-effort delete the file
    audio_path = row.audio_path.replace("\\", "/")
    if audio_path.startswith("uploads/"):
        file_path = UPLOAD_DIR / audio_path.split("/", 1)[1]
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass

    return {"deleted": True}


@app.post("/future-self/reflection", response_model=FutureSelfResponse)
async def future_self(req: FutureSelfRequest):
    reflection = await future_self_reflection(
        prompt=req.prompt,
        journal_summary=req.journal_summary,
        pattern_detected=req.pattern_detected,
        future_self_type=req.future_self_type,
    )
    return FutureSelfResponse(future_self_type=req.future_self_type, reflection=reflection)

