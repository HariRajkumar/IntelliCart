import asyncio
import logging

from fastapi import HTTPException, status

from app.models.order_model import OrderItem
from app.core.order_status import OrderStatus
from app.models.user_model import User, UserAddress

from app.schemas.order_schema import (
    UpdateOrderStatusRequest,
    CheckoutRequest
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
from app.utils.email import (
    send_order_confirmation_email,
    send_logistics_update_email
)

logger = logging.getLogger(__name__)


class OrderService:

    @staticmethod
    async def checkout(
        user_id: str,
        request: CheckoutRequest
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

        # Resolve shipping address
        shipping_address = None
        if request.shipping_address:
            shipping_address = UserAddress(
                id=request.shipping_address.id,
                address_line=request.shipping_address.address_line,
                city=request.shipping_address.city,
                state=request.shipping_address.state,
                postal_code=request.shipping_address.postal_code,
                country=request.shipping_address.country,
                is_default=request.shipping_address.is_default
            )
        elif request.shipping_address_id:
            user = await User.get(user_id)
            if user and user.addresses:
                matching = next((a for a in user.addresses if a.id == request.shipping_address_id), None)
                if matching:
                    shipping_address = matching
        
        # Fallback to user default address if not set
        if not shipping_address:
            user = await User.get(user_id)
            if user and user.addresses:
                default_addr = next((a for a in user.addresses if a.is_default), None)
                if default_addr:
                    shipping_address = default_addr
                elif user.addresses:
                    shipping_address = user.addresses[0]
        
        if not shipping_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipping address is required. Please set up a shipping address in your profile first."
            )

        order_items = []
        deducted_items = []

        try:
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

                # Atomically reduce stock
                success = await ProductRepository.reduce_stock(
                    item.product_id,
                    item.quantity
                )

                if not success:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Insufficient stock "
                            f"for {item.name}"
                        )
                    )

                # Keep track of successfully deducted items
                deducted_items.append((item.product_id, item.quantity))

                order_items.append(
                    OrderItem(
                        product_id=item.product_id,
                        name=item.name,
                        price=item.price,
                        quantity=item.quantity,
                        image=item.image
                    )
                )
        except Exception as e:
            # Programmatic Rollback: restore stock for already deducted items
            for prod_id, qty in deducted_items:
                await ProductRepository.restore_stock(prod_id, qty)
            raise e

        order = await (
            OrderRepository.create_order(
                {
                    "user_id": user_id,
                    "items": order_items,
                    "total_price": cart.total_price,
                    "status": "pending",
                    "shipping_address": shipping_address,
                    "payment_method": request.payment_method,
                    "payment_status": request.payment_status or "pending",
                    "payment_transaction_id": request.payment_transaction_id
                }
            )
        )

        cart.items = []

        cart.total_price = 0

        await CartRepository.save_cart(cart)

        # ---------------------------------------------------------------
        # Send order confirmation email to the customer (fire-and-forget)
        # ---------------------------------------------------------------
        async def _send_confirmation():
            try:
                user = await User.get(user_id)
                if user:
                    await send_order_confirmation_email(
                        to_email=str(user.email),
                        customer_name=user.full_name or str(user.email),
                        order=order
                    )
                    logger.info("Order confirmation email sent to %s", user.email)
            except Exception as exc:
                logger.error("Failed to send order confirmation email: %s", exc)

        asyncio.create_task(_send_confirmation())

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
            "shipping_address": {
                "id": order.shipping_address.id,
                "address_line": order.shipping_address.address_line,
                "city": order.shipping_address.city,
                "state": order.shipping_address.state,
                "postal_code": order.shipping_address.postal_code,
                "country": order.shipping_address.country,
                "is_default": order.shipping_address.is_default
            } if getattr(order, "shipping_address", None) else None,
            "payment_method": getattr(order, "payment_method", None),
            "payment_status": getattr(order, "payment_status", "pending"),
            "payment_transaction_id": getattr(order, "payment_transaction_id", None),
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
                await ProductRepository.restore_stock(
                    item.product_id,
                    item.quantity
                )

        updated_order = await (
            OrderRepository.save_order(order)
        )

        # ---------------------------------------------------------------
        # Send logistics update email when status changes to a key state
        # ---------------------------------------------------------------
        NOTIFY_STATUSES = {OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED}
        if request.status in NOTIFY_STATUSES and old_status != request.status:
            async def _send_update(order_ref=updated_order, new_st=request.status):
                try:
                    user = await User.get(order_ref.user_id)
                    if user:
                        await send_logistics_update_email(
                            to_email=str(user.email),
                            customer_name=user.full_name or str(user.email),
                            order_id=str(order_ref.id),
                            new_status=new_st.value  # use .value → "shipped" / "delivered" / "cancelled"
                        )
                        logger.info(
                            "Logistics update email (%s) sent to %s",
                            new_st.value, user.email
                        )
                except Exception as exc:
                    logger.error("Failed to send logistics update email: %s", exc)

            asyncio.create_task(_send_update())

        return OrderService.serialize_order(
            updated_order
        )

    @staticmethod
    async def cancel_order(
        order_id: str,
        user_id: str
    ):
        order = await OrderRepository.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        if order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to cancel this order"
            )

        if order.status not in (OrderStatus.PENDING, OrderStatus.PROCESSING):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only pending or processing orders can be cancelled. Current status is '{order.status}'."
            )

        order.status = OrderStatus.CANCELLED

        for item in order.items:
            await ProductRepository.restore_stock(item.product_id, item.quantity)

        updated_order = await OrderRepository.save_order(order)
        return OrderService.serialize_order(updated_order)