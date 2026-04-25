from __future__ import annotations

import datetime
import uuid

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class UserProfile(Base):
    __tablename__ = "user_profile"

    # Single-row table (id="me") for local hackathon app.
    id = Column(String, primary_key=True, default="me")
    first_name = Column(String, nullable=True)
    life_stage = Column(String, nullable=True)
    focus = Column(Text, nullable=True)  # JSON array string or free text
    # Full questionnaire payload (JSON) from the Dashboard onboarding flow.
    questionnaire_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    date_key = Column(String, index=True)
    duration = Column(String)
    audio_url = Column(String, nullable=True)
    transcript = Column(Text)
    note = Column(Text, nullable=True)
    mood = Column(String)
    mood_label = Column(String)
    mood_color = Column(String)
    summary = Column(Text)
    emotional_themes = Column(Text)
    pattern_detected = Column(Text)
    next_question = Column(Text, nullable=True)

