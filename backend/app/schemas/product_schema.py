from datetime import datetime
from typing import List

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    images: List[str] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    category: str | None = None
    images: List[str] | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    images: List[str]
    is_active: bool
    created_at: datetime