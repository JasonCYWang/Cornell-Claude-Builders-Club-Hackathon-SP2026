from __future__ import annotations

import json
import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class JournalEntryRow:
    id: str
    created_at: str
    duration: str
    audio_path: str
    transcript: str
    summary: str
    emotion: str
    emotional_themes_json: str
    pattern_detected: str


def get_database_path() -> str:
    return os.getenv("DATABASE_PATH", "./data/futuremirror.sqlite3")


def _connect() -> sqlite3.Connection:
    db_path = Path(get_database_path())
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS journal_entries (
              id TEXT PRIMARY KEY,
              created_at TEXT NOT NULL,
              duration TEXT NOT NULL,
              audio_path TEXT NOT NULL,
              transcript TEXT NOT NULL,
              summary TEXT NOT NULL,
              emotion TEXT NOT NULL,
              emotional_themes TEXT NOT NULL,
              pattern_detected TEXT NOT NULL
            )
            """
        )
        conn.commit()


def insert_journal_entry(
    *,
    id: str,
    created_at: str,
    duration: str,
    audio_path: str,
    transcript: str,
    summary: str,
    emotion: str,
    emotional_themes: List[str],
    pattern_detected: str,
) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO journal_entries (
              id, created_at, duration, audio_path, transcript, summary,
              emotion, emotional_themes, pattern_detected
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id,
                created_at,
                duration,
                audio_path,
                transcript,
                summary,
                emotion,
                json.dumps(emotional_themes),
                pattern_detected,
            ),
        )
        conn.commit()


def _row_to_dataclass(row: sqlite3.Row) -> JournalEntryRow:
    return JournalEntryRow(
        id=str(row["id"]),
        created_at=str(row["created_at"]),
        duration=str(row["duration"]),
        audio_path=str(row["audio_path"]),
        transcript=str(row["transcript"]),
        summary=str(row["summary"]),
        emotion=str(row["emotion"]),
        emotional_themes_json=str(row["emotional_themes"]),
        pattern_detected=str(row["pattern_detected"]),
    )


def list_journal_entries() -> List[JournalEntryRow]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM journal_entries ORDER BY created_at DESC"
        ).fetchall()
    return [_row_to_dataclass(r) for r in rows]


def get_journal_entry(entry_id: str) -> Optional[JournalEntryRow]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM journal_entries WHERE id = ?",
            (entry_id,),
        ).fetchone()
    return _row_to_dataclass(row) if row else None


def delete_journal_entry(entry_id: str) -> bool:
    with _connect() as conn:
        cur = conn.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
        conn.commit()
        return cur.rowcount > 0


def parse_emotional_themes(row: JournalEntryRow) -> List[str]:
    try:
        value = json.loads(row.emotional_themes_json)
        if isinstance(value, list):
            return [str(x) for x in value]
    except Exception:
        pass
    return []


def row_to_frontend_shape(row: JournalEntryRow, *, base_url: str) -> Dict[str, Any]:
    themes = parse_emotional_themes(row)

    audio_url: Optional[str] = None
    if row.audio_path:
        # audio_path is stored like "uploads/<file>"
        audio_url = f"{base_url.rstrip('/')}/{row.audio_path.lstrip('/')}"

    return {
        "id": row.id,
        # Frontend expects a string; ISO is fine and can be formatted client-side.
        "date": row.created_at,
        "duration": row.duration,
        "audioUrl": audio_url,
        "transcript": row.transcript,
        "summary": row.summary,
        "emotion": row.emotion,
        "emotionalThemes": themes,
        "patternDetected": row.pattern_detected,
    }

