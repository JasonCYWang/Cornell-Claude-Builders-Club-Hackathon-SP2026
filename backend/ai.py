from __future__ import annotations

import json
import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

MOOD_VOCABULARY = [
    "joyful",
    "hopeful",
    "calm",
    "anxious",
    "stuck",
    "sad",
    "restless",
    "frustrated",
    "overwhelmed",
    "grateful",
]

MOOD_COLORS = {
    "joyful": "#B8CDB8",
    "hopeful": "#C8D4B8",
    "calm": "#B8CDD8",
    "anxious": "#C8C0D8",
    "stuck": "#C8B8C8",
    "sad": "#B8B8D4",
    "restless": "#D4C8B8",
    "frustrated": "#D4B8B8",
    "overwhelmed": "#D4B8C8",
    "grateful": "#B8D4C8",
}


def _mock_analysis(transcript: str) -> dict:
    return {
        "mood": "anxious",
        "moodLabel": "Feeling a little anxious",
        "moodColor": MOOD_COLORS["anxious"],
        "summary": "It sounds like you’re holding a decision close, and the moment you reach for it, uncertainty pulls you back.",
        "emotionalThemes": ["second-guessing", "waiting for certainty", "self-trust"],
        "patternDetected": "You seem to pause until you can feel completely sure—then notice that sure feeling never quite arrives.",
        "nextQuestion": "If you didn’t need certainty, what would you try first—just as an experiment?",
    }


async def analyze_journal(transcript: str, note: str) -> Dict[str, Any]:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        # Backward-compatible fallback for existing env setups.
        gemini_key = os.getenv("ANTHROPIC_API_KEY")
    if not gemini_key:
        return _mock_analysis(transcript)

    system = (
        "You are a compassionate emotional pattern analyst for FutureMirror, a reflective journaling app. "
        "You are NOT a therapist. Never diagnose or give medical advice. "
        "Use reflective, speculative language. Never say 'this will happen'. "
        "Respond ONLY with valid JSON. No preamble, no markdown fences."
    )

    user = f"""
Analyze this journal transcript and return a JSON object with these EXACT keys:

- mood: ONE word from this list ONLY: {', '.join(MOOD_VOCABULARY)}
- moodLabel: warm 3-6 word phrase, e.g. "Feeling a little anxious" or "Quietly hopeful today"
- summary: 1-2 sentence warm non-judgmental summary of what the person expressed
- emotionalThemes: array of 2-4 short theme strings, e.g. ["perfectionism", "fear of failure"]
- patternDetected: one sentence describing the core emotional pattern observed
- nextQuestion: one gentle open-ended follow-up question to deepen reflection

Transcript:
{transcript}

User note (optional):
{note}
"""

    prompt = f"{system}\n\n{user}"
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json",
        },
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{url}?key={gemini_key}",
                json=body,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
            .strip()
        )
        result = json.loads(text)
    except Exception as e:
        print(f"Gemini analyze failed: {e}")
        return _mock_analysis(transcript)

    mood = result.get("mood")
    if mood not in MOOD_VOCABULARY:
        mood = "anxious"
    result["mood"] = mood
    result["moodColor"] = MOOD_COLORS.get(mood, MOOD_COLORS["anxious"])
    return result


FUTURE_SELF_PERSONAS = {
    "risk": "The version of you who applied, moved, said yes — before feeling ready",
    "safe": "The version of you who waited, stayed, chose the known path",
    "burnt": "The version of you who pushed too hard for too long without rest",
    "fulfilled": "The version of you who found genuine alignment between values and daily life",
    "regret": "The version of you who wishes they had acted differently, and is learning from that",
    "confident": "The version of you who slowly, quietly built trust in their own judgment",
}


async def generate_future_self_letter(
    future_self_type: str, question: str, journal_summary: str, pattern: str
) -> str:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        # Backward-compatible fallback for existing env setups.
        gemini_key = os.getenv("ANTHROPIC_API_KEY")
    if not gemini_key:
        return (
            "There’s a quiet loop in what you wrote—reaching forward, then hesitating at the edge.\n\n"
            "Looking back from here, I found it helped to treat certainty like weather: it comes and goes, "
            "and it isn’t the thing you build a life on. What surprised me was how small actions—ones that "
            "didn’t require a dramatic identity shift—slowly changed the feeling underneath.\n\n"
            "If this pattern continues, you might notice that the pause isn’t a flaw; it’s a signal. "
            "It can be asking for gentleness, information, or a way to try without committing.\n\n"
            "What would feel like a ‘safe-to-try’ version of your next step—one you could revisit without "
            "punishing yourself for changing your mind?"
        )

    persona = FUTURE_SELF_PERSONAS.get(future_self_type, "A future version of you")

    system = (
        "You are writing a personal letter as a specific possible version of the user's future self. "
        "Speak in first person as that future self. Use a letter format (no 'Dear' needed). "
        "NEVER be authoritative — use 'I found that...', 'what surprised me was...', 'you might discover...' "
        "NEVER say 'you will' — only 'you might', 'I noticed', 'looking back...' "
        "No commands. Offer perspective, not instructions. "
        "Never use the word 'diagnose'. "
        "Respond with ONLY the letter text."
    )

    user = f"""
Write a letter from: {persona}

Context about the past self right now:
- Pattern detected in their recent journal: {pattern}
- Journal summary: {journal_summary}
- Question they're asking you: {question}

The letter should:
- Open with a grounding observation (not 'Dear [name]')
- Reference the pattern without being clinical
- Share what this future self learned or noticed
- End with something that opens reflection, not closes it
- Be 150-220 words
- Use gentle, literary language — not coaching-speak
"""

    prompt = f"{system}\n\n{user}"
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
        },
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{url}?key={gemini_key}",
                json=body,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
            .strip()
        )
        if not text:
            raise ValueError("Gemini returned empty letter text")
        return text
    except Exception as e:
        print(f"Gemini letter failed: {e}")
        return (
            "There’s a quiet loop in what you wrote—reaching forward, then hesitating at the edge.\n\n"
            "Looking back from here, I found it helped to treat certainty like weather: it comes and goes, "
            "and it isn’t the thing you build a life on. What surprised me was how small actions—ones that "
            "didn’t require a dramatic identity shift—slowly changed the feeling underneath.\n\n"
            "If this pattern continues, you might notice that the pause isn’t a flaw; it’s a signal. "
            "It can be asking for gentleness, information, or a way to try without committing.\n\n"
            "What would feel like a safe-to-try version of your next step—one you could revisit without "
            "punishing yourself for changing your mind?"
        )

