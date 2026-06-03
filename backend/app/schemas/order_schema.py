from pydantic import BaseModel

from app.core.order_status import OrderStatus


class UpdateOrderStatusRequest(BaseModel):

    status: OrderStatus