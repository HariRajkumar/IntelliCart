from datetime import datetime
from app.database.connection import db_conn
from app.utils.logger import logger

class MongoChatHistory:
    @staticmethod
    async def get_history(user_id: str, limit: int = 20) -> list:
        db = db_conn.db
        if db is None:
            logger.warning("Database connection not active; returning empty history")
            return []
        
        # Fetch the most recent messages, then reverse them to be in chronological order
        cursor = db["chat_history"].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
        messages = await cursor.to_list(length=limit)
        messages.reverse()
        
        return [
            {
                "role": msg["role"],
                "content": msg["content"],
                "timestamp": msg["timestamp"].isoformat() if isinstance(msg["timestamp"], datetime) else msg["timestamp"]
            }
            for msg in messages
        ]

    @staticmethod
    async def add_message(user_id: str, role: str, content: str):
        db = db_conn.db
        if db is None:
            logger.warning("Database connection not active; cannot save message")
            return
        
        logger.info(f"Adding {role} message to chat history for user {user_id}")
        await db["chat_history"].insert_one({
            "user_id": user_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        })

    @staticmethod
    async def clear_history(user_id: str):
        db = db_conn.db
        if db is None:
            logger.warning("Database connection not active; cannot clear history")
            return
        
        logger.info(f"Clearing chat history for user {user_id}")
        await db["chat_history"].delete_many({"user_id": user_id})
