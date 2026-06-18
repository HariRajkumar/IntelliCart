from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel, Field

from app.core.order_status import OrderStatus
from app.models.user_model import UserAddress


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

    shipping_address: Optional[UserAddress] = None

    payment_method: Optional[str] = None

    payment_status: str = "pending"

    payment_transaction_id: Optional[str] = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "orders"