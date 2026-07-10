from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.core.roles import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserAddressCreate(BaseModel):
    address_line: str = Field(..., min_length=3, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = Field(default="India", min_length=2, max_length=100)
    is_default: bool = False


class UserAddressUpdate(BaseModel):
    address_line: Optional[str] = Field(None, min_length=3, max_length=200)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=3, max_length=20)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    is_default: Optional[bool] = None


class UserAddressResponse(BaseModel):
    id: str
    address_line: str
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone_number: Optional[str] = Field(None, min_length=5, max_length=20)


class UserPasswordChange(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    phone_number: Optional[str] = None
    addresses: List[UserAddressResponse] = []
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"