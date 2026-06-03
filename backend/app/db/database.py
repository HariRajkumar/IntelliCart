from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user_model import User
from app.models.product_model import Product
from app.models.category_model import Category


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGO_URL)

    await init_beanie(
        database=db.client[settings.DATABASE_NAME],
        document_models=[
            User,
            Product,
            Category
        ]
    )

    print("Connected to MongoDB")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")