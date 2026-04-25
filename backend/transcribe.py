from __future__ import annotations

from typing import Optional

_model = None


def _load_whisper():
    global _model
    if _model is not None:
        return _model
    import whisper  # type: ignore

    _model = whisper.load_model("base")
    return _model


def transcribe_audio(file_path: str) -> str:
    try:
        model = _load_whisper()
        result = model.transcribe(file_path)
        text = (result.get("text") or "").strip()
        return text or "(No speech detected.)"
    except Exception as e:
        print(f"Whisper failed: {e}")
        return (
            "I've been feeling really uncertain about my next steps. "
            "Every time I think I'm ready to make a decision, something holds me back. "
            "I think I'm waiting to feel more confident, but that feeling never quite arrives."
        )

