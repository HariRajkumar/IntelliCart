from datetime import datetime
from typing import List

from beanie import Document
from pydantic import BaseModel, Field


class CartItem(BaseModel):

    product_id: str

    name: str

    price: float

    quantity: int

    image: str | None = None


class Cart(Document):

    user_id: str

    items: List[CartItem] = []

    total_price: float = 0

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "carts"