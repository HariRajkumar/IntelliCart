from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.test_routes import router as test_router
from app.api.auth_routes import router as auth_router
from app.api.user_routes import router as user_router
from app.api.product_routes import router as product_router
from app.api.category_routes import router as category_router
from app.api.cart_routes import router as cart_router
from app.api.order_routes import router as order_router

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

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    user_router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    product_router,
    prefix="/api/v1/products",
    tags=["Products"]
)

app.include_router(
    category_router,
    prefix="/api/v1/categories",
    tags=["Categories"]
)

app.include_router(
    cart_router,
    prefix="/api/v1/cart",
    tags=["Cart"]
)

app.include_router(
    order_router,
    prefix="/api/v1/orders",
    tags=["Orders"]
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