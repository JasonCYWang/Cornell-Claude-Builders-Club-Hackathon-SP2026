from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JournalEntryOut(BaseModel):
    id: str
    date: str
    duration: str
    audioUrl: Optional[str] = None
    transcript: str
    summary: str
    emotion: str
    emotionalThemes: List[str] = Field(default_factory=list)
    patternDetected: str


class FutureSelfRequest(BaseModel):
    prompt: str
    journal_summary: Optional[str] = None
    pattern_detected: Optional[str] = None
    future_self_type: str


class FutureSelfResponse(BaseModel):
    future_self_type: str
    reflection: str


def iso_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

