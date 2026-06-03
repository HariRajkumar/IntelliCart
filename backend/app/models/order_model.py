from datetime import datetime
from typing import List

from beanie import Document
from pydantic import BaseModel, Field

from app.core.order_status import OrderStatus


class OrderItem(BaseModel):

    product_id: str

    name: str

    price: float

    quantity: int

    image: str | None = None


class Order(Document):

    user_id: str

    items: List[OrderItem]

    total_price: float

    status: OrderStatus = OrderStatus.PENDING

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "orders"