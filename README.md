# FutureMirror

Voice journaling → mood + pattern reflection → letters from possible future selves.

## Run (local dev)

### Backend
```windows cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000

```
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.


## Notes

- Calendar UI is custom CSS Grid (no calendar UI library).
- AI output is reflective/speculative (not therapy; no diagnoses).
- If `ANTHROPIC_API_KEY` isn’t set, the backend uses mock analysis + mock letters.

