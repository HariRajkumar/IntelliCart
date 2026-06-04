# IntelliCart

IntelliCart is a full-stack e-commerce demo application with a FastAPI backend and a React + Vite frontend.

## Project structure

- `backend/` — FastAPI API server, MongoDB integration, authentication, products, categories, cart, and order management.
- `frontend/` — React/Vite app with product browsing, login/register, cart, and checkout pages.
- `DEV_MANUAL.md` — detailed developer manual describing backend and frontend flows, API behavior, and important files.

## Setup

### Backend

1. Create a `.env` file in `backend/` with:
   - `MONGO_URL`
   - `DATABASE_NAME`
   - `JWT_SECRET`

2. Install dependencies and run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development notes

- Backend API base URL: `http://localhost:8000/api/v1`
- Frontend dev server: `http://localhost:5173`
- Static product images are served from `http://localhost:8000/uploads`.
- Authentication uses JWT tokens stored in `localStorage`.

## Useful files

- `DEV_MANUAL.md` — detailed documentation of routes, services, and page flows.
- `backend/app/main.py` — backend app entrypoint.
- `frontend/src/api/axios.js` — frontend API client.

## Recommended next steps

- Create `.env` for backend configuration.
- Start backend before the frontend.
- Use `DEV_MANUAL.md` for full feature and flow details.
