from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import EmailStr, Field

from app.core.roles import UserRole


class User(Document):
    full_name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr = Field(..., unique=True)

    hashed_password: str

    role: UserRole = UserRole.CUSTOMER

    is_active: bool = True

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Hari Rajkumar",
                "email": "hari@example.com",
                "role": "customer"
            }
        }