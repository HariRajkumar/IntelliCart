from fastapi import HTTPException, status

from app.models.order_model import OrderItem
from app.core.order_status import OrderStatus

from app.schemas.order_schema import (
    UpdateOrderStatusRequest
)
from app.repositories.cart_repository import (
    CartRepository
)
from app.repositories.order_repository import (
    OrderRepository
)
from app.repositories.product_repository import (
    ProductRepository
)


class OrderService:

    @staticmethod
    async def checkout(
        user_id: str
    ):

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        order_items = []

        for item in cart.items:

            product = await (
                ProductRepository.get_product_by_id(
                    item.product_id
                )
            )

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        f"Product not found: "
                        f"{item.name}"
                    )
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock "
                        f"for {item.name}"
                    )
                )

            await (
                ProductRepository.reduce_stock(
                    product,
                    item.quantity
                )
            )

            order_items.append(
                OrderItem(
                    product_id=item.product_id,
                    name=item.name,
                    price=item.price,
                    quantity=item.quantity,
                    image=item.image
                )
            )

        order = await (
            OrderRepository.create_order(
                {
                    "user_id": user_id,
                    "items": order_items,
                    "total_price": cart.total_price,
                    "status": "pending"
                }
            )
        )

        cart.items = []

        cart.total_price = 0

        await CartRepository.save_cart(cart)

        return OrderService.serialize_order(order)

    @staticmethod
    async def get_my_orders(
        user_id: str
    ):

        orders = await (
            OrderRepository.get_orders_by_user_id(
                user_id
            )
        )

        return [
            OrderService.serialize_order(order)
            for order in orders
        ]

    @staticmethod
    async def get_all_orders():

        orders = await (
            OrderRepository.get_all_orders()
        )

        return [
            OrderService.serialize_order(order)
            for order in orders
        ]

    @staticmethod
    def serialize_order(order):

        return {
            "id": str(order.id),
            "user_id": order.user_id,
            "items": [
                {
                    "product_id": item.product_id,
                    "name": item.name,
                    "price": item.price,
                    "quantity": item.quantity,
                    "image": item.image
                }
                for item in order.items
            ],
            "total_price": order.total_price,
            "status": order.status,
            "created_at": order.created_at
        }
    
    @staticmethod
    async def update_order_status(
        order_id: str,
        request: UpdateOrderStatusRequest
    ):

        order = await (
            OrderRepository.get_order_by_id(
                order_id
            )
        )

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        old_status = order.status

        order.status = request.status

        if (
            request.status == OrderStatus.CANCELLED
            and old_status != OrderStatus.CANCELLED
        ):

            for item in order.items:

                product = await (
                    ProductRepository.get_product_by_id(
                        item.product_id
                    )
                )

                if product:

                    await (
                        ProductRepository.restore_stock(
                            product,
                            item.quantity
                        )
                    )

        updated_order = await (
            OrderRepository.save_order(order)
        )

        return OrderService.serialize_order(
            updated_order
        )