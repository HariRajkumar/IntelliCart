from datetime import datetime
from typing import Optional, List
import uuid

from beanie import Document
from pydantic import BaseModel, EmailStr, Field

from app.core.roles import UserRole


class UserAddress(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str = "India"
    is_default: bool = False


class User(Document):
    full_name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr = Field(..., unique=True)

    hashed_password: str

    role: UserRole = UserRole.CUSTOMER

    is_active: bool = True

    is_verified: bool = False

    phone_number: Optional[str] = None

    addresses: List[UserAddress] = []

    otp: Optional[str] = None

    otp_expiry: Optional[datetime] = None

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