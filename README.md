Cornell-Claude-Builders-Club-Hackathon-SP2026

Team Name: The Coffees & Non-Coffees

Project Structure
- src/new_software/: main package source code
- tests/: unit tests with pytest
- pyproject.toml: packaging and tooling configuration
- .gitignore: common Python ignores

Gemini API Setup
This project uses Google's Gemini API for AI-powered features.

1. Get an API Key
Go to: https://aistudio.google.com/
Sign in with your Google account and create a new API key.

2. Create Your Environment File
macOS/Linux: cp .env.example .env
Windows (cmd): copy .env.example .env
Windows (PowerShell): cp .env.example .env

3. Add Your API Key
In .env file:
GEMINI_API_KEY=your_api_key_here

4. Restart Your App
Restart the server after updating environment variables.

Quick Start

macOS/Linux:

cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

python app.py

Windows (cmd):

cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

python app.py

Windows (PowerShell):

cd backend

python -m venv .venv

.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

python app.py

Linting and Type Checking

ruff check .

mypy src

Notes
- Activate virtual environment before installing dependencies.
- Ensure dependencies are installed if commands are missing.
- Do not commit .env file

