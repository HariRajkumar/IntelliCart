from typing import Optional
from pydantic import BaseModel

from app.core.order_status import OrderStatus
from app.schemas.user_schema import UserAddressResponse


class UpdateOrderStatusRequest(BaseModel):

    status: OrderStatus


class CheckoutRequest(BaseModel):
    shipping_address_id: Optional[str] = None
    shipping_address: Optional[UserAddressResponse] = None
    payment_method: str
    payment_transaction_id: Optional[str] = None
    payment_status: Optional[str] = "pending"