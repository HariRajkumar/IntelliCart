from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class Product(Document):

    name: str = Field(
        ...,
        min_length=2,
        max_length=200
    )

    description: str = Field(
        ...,
        min_length=10
    )

    price: float = Field(
        ...,
        gt=0
    )

    stock: int = Field(
        default=0,
        ge=0
    )

    category: str

    images: List[str] = []

    is_active: bool = True

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "products"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Gaming Mouse",
                "description": "High precision gaming mouse",
                "price": 59.99,
                "stock": 100,
                "category": "Electronics"
            }
        }