from __future__ import annotations

import json
import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, ".env"))

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

FUTURE_SELF_PERSONAS = {
    "ceo": "CEO Version of You — strategic, decisive, and allergic to excuses.",
    "brutal": "Brutally Honest You — sharp, witty, and painfully clear.",
    "zen": "Calm Zen You — grounded, spacious, and wise under pressure.",
    "villain": "Villain Arc You — unapologetic boundaries, high standards, no fluff.",
    "main-character": "Main Character You — cinematic, bold, and emotionally tuned in.",
    "delusional-confidence": "Delusional Confidence You — ridiculous belief with chaotic momentum.",
}

APPROVAL_BADGES = [
    "Approved",
    "Character Development",
    "Deeply Concerning",
    "Villain Origin Story",
    "Future Cringe Detected",
]


def _gemini_model() -> str:
    return (os.getenv("GEMINI_MODEL") or "gemini-2.5-flash").strip()


def _gemini_key() -> str | None:
    return os.getenv("GEMINI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")


def _extract_text(data: dict) -> str:
    return (
        data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
        .strip()
    )


async def _gemini_generate(
    prompt: str,
    *,
    temperature: float,
    response_mime_type: str | None = None,
) -> str:
    key = _gemini_key()
    if not key:
        raise RuntimeError("Gemini key is not configured")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{_gemini_model()}:generateContent"
    generation_config: dict[str, Any] = {"temperature": temperature}
    if response_mime_type:
        generation_config["responseMimeType"] = response_mime_type
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": generation_config}
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            url,
            json=body,
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
        )
        resp.raise_for_status()
        return _extract_text(resp.json())


def _mock_analysis(_: str) -> dict:
    return {
        "mood": "anxious",
        "moodLabel": "Feeling a little anxious",
        "moodColor": MOOD_COLORS["anxious"],
        "summary": "You are circling a decision, wanting certainty before you move.",
        "emotionalThemes": ["second-guessing", "fear of momentum", "self-trust"],
        "patternDetected": "You keep waiting for a perfect signal before taking imperfect action.",
        "nextQuestion": "What tiny move would feel bold but still safe enough to try today?",
    }


async def analyze_journal(transcript: str, note: str) -> Dict[str, Any]:
    if not _gemini_key():
        return _mock_analysis(transcript)
    prompt = f"""
You analyze journals for FutureMirror.
Never use the word diagnose.
Not medical, not therapy.
Respond as strict JSON only.

Return EXACT keys:
- mood (one of: {', '.join(MOOD_VOCABULARY)})
- moodLabel (3-6 words)
- summary (1-2 warm sentences)
- emotionalThemes (2-4 short strings)
- patternDetected (1 sentence)
- nextQuestion (1 gentle question)

Transcript:
{transcript}

User note:
{note}
"""
    try:
        text = await _gemini_generate(prompt, temperature=0.4, response_mime_type="application/json")
        result = json.loads(text)
    except Exception as e:
        print(f"Gemini analyze failed: {e}")
        return _mock_analysis(transcript)
    mood = result.get("mood")
    if mood not in MOOD_VOCABULARY:
        mood = "anxious"
    result["mood"] = mood
    result["moodColor"] = MOOD_COLORS[mood]
    return result


def _fallback_letter(roast_mode: bool = False) -> str:
    if roast_mode:
        return (
            "You keep saying 'later' like later is in your contacts.\n\n"
            "At this point, procrastination has a reserved parking spot in your life. "
            "I am not saying you lack potential - I am saying your potential is waiting in the lobby.\n\n"
            "If this pattern keeps running, you might become extremely talented at preparing to begin. "
            "What would happen if you made one move so small it feels almost laughable, and did it anyway?"
        )
    return (
        "I remember this exact season: thinking clarity had to come before movement.\n\n"
        "Looking back, what changed me was not a dramatic reinvention but a string of ordinary brave choices. "
        "If this pattern continues, you might notice that your life is shaped less by certainty and more by repetition.\n\n"
        "What is one small choice that your future self would quietly thank you for?"
    )


async def generate_future_self_letter(
    future_self_type: str,
    question: str,
    journal_summary: str,
    pattern: str,
    *,
    roast_mode: bool = False,
    reality_check: bool = False,
) -> str:
    if not _gemini_key():
        return _fallback_letter(roast_mode=roast_mode or reality_check)
    persona = FUTURE_SELF_PERSONAS.get(future_self_type, "A vivid future version of you")
    tone = (
        "Be witty, sharp, and playful without cruelty."
        if roast_mode
        else "Be warm, vivid, and emotionally precise."
    )
    if reality_check:
        tone += " Give one cinematic truth punch in the middle."
    prompt = f"""
Write a letter from this persona: {persona}
Tone: {tone}
Rules:
- First person voice from future self.
- Speculative language only: use might/could/looking back.
- Never use diagnose.
- 140-220 words.
- No chat format, no bullets.

Context:
- Pattern: {pattern}
- Summary: {journal_summary}
- User question: {question}
"""
    try:
        text = await _gemini_generate(prompt, temperature=0.85)
        return text or _fallback_letter(roast_mode=roast_mode or reality_check)
    except Exception as e:
        print(f"Gemini letter failed: {e}")
        return _fallback_letter(roast_mode=roast_mode or reality_check)


async def evaluate_future_approval(question: str, context: str) -> dict:
    if not _gemini_key():
        badge = APPROVAL_BADGES[hash(question) % len(APPROVAL_BADGES)]
        return {"badge": badge, "reason": "Your future timeline is requesting higher standards."}
    prompt = f"""
Classify this decision into ONE badge exactly:
{', '.join(APPROVAL_BADGES)}

Input: {question}
Context: {context}

Return JSON: {{"badge":"...","reason":"one witty sentence"}}
Reason should be playful, memorable, and not mean.
"""
    try:
        text = await _gemini_generate(prompt, temperature=0.8, response_mime_type="application/json")
        data = json.loads(text)
        if data.get("badge") not in APPROVAL_BADGES:
            data["badge"] = "Character Development"
        if not data.get("reason"):
            data["reason"] = "Your future self says this decision has plot consequences."
        return data
    except Exception as e:
        print(f"Gemini approval failed: {e}")
        return {
            "badge": "Character Development",
            "reason": "Your future self says this decision has plot consequences.",
        }


async def detect_delusion(statement: str) -> dict:
    if not _gemini_key():
        return {
            "severity": "High",
            "message": "Delusion detected: you keep hiring tomorrow to do today's work.",
        }
    prompt = f"""
You are Delusion Detector for a playful future-self app.
Analyze statement: {statement}
Return JSON with keys:
- severity (Low, Medium, High, Extreme)
- message (one witty sentence, playful not cruel)
"""
    try:
        text = await _gemini_generate(prompt, temperature=0.85, response_mime_type="application/json")
        data = json.loads(text)
        sev = str(data.get("severity") or "Medium").title()
        if sev not in {"Low", "Medium", "High", "Extreme"}:
            sev = "Medium"
        msg = data.get("message") or "Delusion detected. Timeline confidence is unstable."
        return {"severity": sev, "message": msg}
    except Exception as e:
        print(f"Gemini delusion failed: {e}")
        return {"severity": "High", "message": "Delusion detected. Tomorrow is not a strategy."}

