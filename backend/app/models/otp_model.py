from datetime import datetime
from beanie import Document
from pydantic import EmailStr, Field


class OTP(Document):
    email: EmailStr = Field(..., unique=True)
    otp: str
    otp_expiry: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "otps"
