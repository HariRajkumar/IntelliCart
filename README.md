# IntelliCart

IntelliCart is a full-stack e-commerce demo application with a FastAPI backend and a React + Vite frontend.

## Project structure

- `backend/` — FastAPI API server, MongoDB integration, authentication, products, categories, cart, and order management.
- `frontend/` — React/Vite app with product browsing, login/register, cart, and checkout pages.
- `docker-compose.yml` — optional containerized development stack for backend, frontend, and MongoDB.
- `nginx/` — reverse-proxy configuration assets for containerized deployments.
- `DEV_MANUAL.md` — detailed developer manual describing backend and frontend flows, API behavior, and important files.

## Setup

### Backend

1. Create a `.env` file in the repository root or in `backend/` with:
   - `MONGODB_URL`
   - `DATABASE_NAME`
   - `JWT_SECRET_KEY`
   - `JWT_ALGORITHM`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`

2. Install dependencies and run locally:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Create a `.env` file in `frontend/` or the repo root with:
   - `VITE_API_URL=http://localhost:8000/api/v1`

2. Install dependencies and run:

```bash
cd frontend
npm install
npm run dev
```

### Containerized development

From the repo root, you can also start the full stack with Docker Compose:

```bash
docker compose up --build
```

This starts:
- backend on `http://localhost:8000`
- frontend on `http://localhost:5173`
- MongoDB on `mongodb://localhost:27017`

## Development notes

- Backend API base URL: `http://localhost:8000/api/v1`
- Frontend dev server: `http://localhost:5173`
- Static product images are served from `http://localhost:8000/uploads`.
- Frontend Axios uses `import.meta.env.VITE_API_URL` for the API base URL.
- Authentication uses JWT tokens stored in `localStorage`.
- The backend uses CORS to allow requests from `http://localhost:5173`.

## Useful files

- `DEV_MANUAL.md` — detailed documentation of routes, services, and page flows.
- `docker-compose.yml` — developer stack for backend, frontend, and MongoDB.
- `backend/Dockerfile` — backend container build.
- `frontend/Dockerfile` — frontend container build.
- `backend/app/main.py` — backend app entrypoint.
- `frontend/src/api/axios.js` — frontend API client.

## Recommended next steps

- Create `.env` for back-end and front-end configuration.
- Start backend before the frontend when running locally.
- Use `DEV_MANUAL.md` for full feature and flow details.
