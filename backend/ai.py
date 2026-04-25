from __future__ import annotations

import os
from typing import List, Optional, Tuple


MOCK_TRANSCRIPT = (
    "I talked about feeling behind, delaying applications, and worrying that I am not ready."
)

MOCK_SUMMARY = (
    "You talked about feeling behind, delaying applications, and worrying that you are not ready."
)
MOCK_EMOTION = "anxious"
MOCK_THEMES = ["anxiety", "comparison", "perfectionism"]
MOCK_PATTERN = "Waiting for confidence before taking action"


def transcription_configured() -> bool:
    # TODO: connect transcription endpoint
    return bool(os.getenv("TRANSCRIPTION_API_KEY"))


async def transcribe_audio(_file_path: str) -> str:
    # TODO: connect transcription endpoint
    if not transcription_configured():
        return MOCK_TRANSCRIPT
    # Placeholder for future provider
    return MOCK_TRANSCRIPT


def summarize_and_detect(transcript: str) -> Tuple[str, str, List[str], str]:
    """
    Returns: (summary, emotion, emotional_themes, pattern_detected)

    This is a lightweight heuristic mock that keeps the backend usable
    before AI providers are wired up.
    """
    text = transcript.lower()

    themes: List[str] = []
    if "compare" in text or "comparison" in text:
        themes.append("comparison")
    if "perfect" in text or "perfection" in text:
        themes.append("perfectionism")
    if "behind" in text or "worried" in text or "anxious" in text:
        themes.append("anxiety")

    if not themes:
        themes = list(MOCK_THEMES)

    emotion = "anxious" if "anxiety" in themes else MOCK_EMOTION

    pattern = MOCK_PATTERN
    summary = MOCK_SUMMARY
    return summary, emotion, themes, pattern


def _crisis_guardrail_text() -> str:
    return (
        "I’m really sorry you’re going through this. I can’t help with emergencies, "
        "but you deserve immediate, real-world support. If you feel in danger or might hurt yourself, "
        "please call your local emergency number right now, or reach out to a trusted person nearby. "
        "If you’re in the U.S., you can call or text 988 for the Suicide & Crisis Lifeline."
    )


def _looks_like_crisis(text: str) -> bool:
    t = text.lower()
    keywords = [
        "suicide",
        "kill myself",
        "end my life",
        "self-harm",
        "hurt myself",
        "can't go on",
        "i want to die",
    ]
    return any(k in t for k in keywords)


async def future_self_reflection(
    *,
    prompt: str,
    journal_summary: Optional[str],
    pattern_detected: Optional[str],
    future_self_type: str,
) -> str:
    """
    Uses Anthropic if configured; otherwise returns a polished mock reflection.

    Safety:
    - Not therapy language
    - No diagnosis
    - Avoids certainty ("if this pattern continues...")
    - Crisis keywords trigger a supportive escalation message
    """
    combined = " ".join([prompt or "", journal_summary or "", pattern_detected or ""]).strip()
    if _looks_like_crisis(combined):
        return _crisis_guardrail_text()

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        pattern = pattern_detected or MOCK_PATTERN
        summary = journal_summary or MOCK_SUMMARY
        return (
            f"From the perspective of **{future_self_type}**:\n\n"
            f"If this pattern continues — **{pattern}** — you may keep postponing the very moments "
            f"that build confidence. Consider choosing one small action that’s safe enough to do today.\n\n"
            f"Based on your latest reflection: {summary}\n\n"
            "Try this: write the *smallest possible next step* and do it before you feel ready. "
            "Then notice what changes — not in the outcome, but in your self-trust."
        )

    # Anthropic integration (kept minimal; safe prompt; no therapy claims)
    try:
        from anthropic import Anthropic  # type: ignore

        client = Anthropic(api_key=api_key)

        system = (
            "You are FutureMirror, a calm reflective writing assistant. "
            "Do not present yourself as therapy or a clinician. Do not diagnose. "
            "Use conditional language like 'if this pattern continues...' and avoid certainty. "
            "If the user expresses self-harm or imminent danger, respond with encouragement to seek immediate real-world help."
        )

        user = (
            f"Future self type: {future_self_type}\n"
            f"User prompt: {prompt}\n"
            f"Journal summary: {journal_summary or ''}\n"
            f"Pattern detected: {pattern_detected or ''}\n\n"
            "Write a warm, premium, mirror-like reflection (120-220 words)."
        )

        msg = client.messages.create(
            model="claude-3-7-sonnet-latest",
            max_tokens=350,
            temperature=0.7,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        # Anthropic python SDK returns content blocks
        content = getattr(msg, "content", None)
        if isinstance(content, list) and content and hasattr(content[0], "text"):
            return str(content[0].text)
        return str(msg)
    except Exception:
        # Fail safe to mock on any provider error
        pattern = pattern_detected or MOCK_PATTERN
        summary = journal_summary or MOCK_SUMMARY
        return (
            f"From the perspective of **{future_self_type}**:\n\n"
            f"If this pattern continues — **{pattern}** — you may keep postponing action until confidence arrives. "
            "But confidence is often a consequence, not a prerequisite.\n\n"
            f"Based on your latest reflection: {summary}\n\n"
            "Pick one small step you can complete in 10 minutes. Do it imperfectly. Then let that be evidence."
        )

