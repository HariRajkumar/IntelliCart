from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.core.roles import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime