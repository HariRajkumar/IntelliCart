from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import db_conn
from app.routes.chat import router as chat_router
from app.utils.config import settings
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to MongoDB
    logger.info("Initializing AI Services...")
    db_conn.connect()
    yield
    # Close connection
    db_conn.close()
    logger.info("Shutdown complete.")

app = FastAPI(
    title="IntelliCart AI Services",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    chat_router,
    prefix="/api/v1",
    tags=["Chat"]
)

@app.get("/")
async def root():
    return {"message": "IntelliCart AI Services is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
