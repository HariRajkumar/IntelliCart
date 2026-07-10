from enum import Enum


class OrderStatus(str, Enum):

    PENDING = "pending"

    PROCESSING = "processing"

    SHIPPED = "shipped"

    OUT_FOR_DELIVERY = "out_for_delivery"

    DELIVERED = "delivered"

    CANCELLED = "cancelled"