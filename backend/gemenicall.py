"""
Legacy Gemini helper module (no Flask).

This project now runs a FastAPI backend in `backend/main.py`, and the frontend
talks to it via `frontend/src/api/client.ts`.

The original `gemenicall.py` was a standalone Flask app with an embedded HTML UI
and a `/future-self` endpoint. That no longer matches the architecture, and it
also depended on a `journal` module that isn't part of this repo.

This file remains as a small, importable compatibility layer so any older code
that imported `gemenicall` can still generate a “future self” letter by calling
the same underlying Gemini logic used by FastAPI (`backend/ai.py`).
"""

from __future__ import annotations

import asyncio
from typing import Optional

from ai import generate_future_self_letter


async def generate_future_self_response(
    *,
    future_self_type: str,
    question: str,
    journal_summary: str,
    pattern_detected: str,
) -> str:
    """
    Generates a reflective “future self” response.

    This mirrors the behavior of the FastAPI endpoint `POST /future-self/reflection`
    in `backend/main.py`, so the frontend can call the backend without Flask.
    """

    q = (question or "").strip() or "What do you want me to notice first?"
    return await generate_future_self_letter(
        future_self_type=(future_self_type or "").strip(),
        question=q,
        journal_summary=(journal_summary or "").strip(),
        pattern=(pattern_detected or "").strip(),
    )


def generate_future_self_response_sync(
    *,
    future_self_type: str,
    question: str,
    journal_summary: str,
    pattern_detected: str,
) -> str:
    """
    Synchronous wrapper around `generate_future_self_response`.
    Handy for quick scripts/tests.
    """

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # If we're already in an event loop (rare in scripts), we can't `run`.
        # In that case, users should call the async function directly.
        raise RuntimeError(
            "generate_future_self_response_sync() cannot be used inside a running event loop. "
            "Use `await generate_future_self_response(...)` instead."
        )

    return asyncio.run(
        generate_future_self_response(
            future_self_type=future_self_type,
            question=question,
            journal_summary=journal_summary,
            pattern_detected=pattern_detected,
        )
    )