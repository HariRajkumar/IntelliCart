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
    mrp: float | None = None
    discount: float | None = None
    rating: float | None = None
    reviews_count: int | None = None
    seller_name: str | None = "IntelliCart Central Hub"
    seller_postal_code: str | None = "400001"
    specifications: dict[str, str] | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    category: str | None = None
    images: List[str] | None = None
    is_active: bool | None = None
    mrp: float | None = None
    discount: float | None = None
    rating: float | None = None
    reviews_count: int | None = None
    seller_name: str | None = None
    seller_postal_code: str | None = None
    specifications: dict[str, str] | None = None


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
    mrp: float | None = None
    discount: float
    rating: float
    reviews_count: int
    seller_name: str | None = None
    seller_postal_code: str | None = None
    specifications: dict[str, str] = {}