from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.config import settings
from app.utils.logger import logger

class MongoDBConnection:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}")
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.DATABASE_NAME]

    def close(self):
        if self.client:
            logger.info("Closing MongoDB connection")
            self.client.close()

db_conn = MongoDBConnection()
