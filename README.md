# BuildByte Hackathon

## What's inside

- `apps/web` — React + Vite frontend (port 3000)
- `apps/api` — FastAPI backend (port 8000)

## Quick start

```sh
# Install frontend dependencies
npm install

# Set up the API
cd apps/api
 python -m venv venv
venv\Scripts\pip install -r requirements.txt
cd ../..

# Start the API (terminal 1)
cd apps/api && venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Start the frontend (terminal 2)
npm run dev --filter=web
```

Open http://localhost:3000 — you should see the health check message.
