from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.test_routes import router as test_router
from app.api.auth_routes import router as auth_router
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting IntelliCart API...")

    await connect_to_mongo()

    yield

    await close_mongo_connection()

    print("Shutting down IntelliCart API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    test_router,
    prefix="/api/v1/test",
    tags=["Test"]
)


@app.get("/")
async def root():
    return {
        "message": "IntelliCart Backend Running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }