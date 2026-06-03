from fastapi import HTTPException, status

from app.models.cart_model import CartItem
from app.repositories.cart_repository import (
    CartRepository
)
from app.repositories.product_repository import (
    ProductRepository
)
from app.schemas.cart_schema import (
    AddToCartRequest
)


class CartService:

    @staticmethod
    async def add_to_cart(
        user_id: str,
        request: AddToCartRequest
    ):

        product = await (
            ProductRepository.get_product_by_id(
                request.product_id
            )
        )

        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product.stock < request.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart:

            cart = await (
                CartRepository.create_cart(
                    {
                        "user_id": user_id,
                        "items": [],
                        "total_price": 0
                    }
                )
            )

        existing_item = next(
            (
                item
                for item in cart.items
                if item.product_id == request.product_id
            ),
            None
        )

        if existing_item:

            existing_item.quantity += request.quantity

        else:

            cart.items.append(
                CartItem(
                    product_id=str(product.id),
                    name=product.name,
                    price=product.price,
                    quantity=request.quantity,
                    image=(
                        product.images[0]
                        if product.images
                        else None
                    )
                )
            )

        cart.total_price = sum(
            item.price * item.quantity
            for item in cart.items
        )

        updated_cart = await (
            CartRepository.save_cart(cart)
        )

        return CartService.serialize_cart(
            updated_cart
        )

    @staticmethod
    async def get_cart(
        user_id: str
    ):

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart:

            return {
                "items": [],
                "total_price": 0
            }

        return CartService.serialize_cart(cart)

    @staticmethod
    def serialize_cart(cart):

        return {
            "id": str(cart.id),
            "user_id": cart.user_id,
            "items": [
                {
                    "product_id": item.product_id,
                    "name": item.name,
                    "price": item.price,
                    "quantity": item.quantity,
                    "image": item.image
                }
                for item in cart.items
            ],
            "total_price": cart.total_price
        }
    
    @staticmethod
    async def remove_from_cart(
        user_id: str,
        product_id: str
    ):

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )

        cart.items = [
            item
            for item in cart.items
            if item.product_id != product_id
        ]

        cart.total_price = sum(
            item.price * item.quantity
            for item in cart.items
        )

        updated_cart = await (
            CartRepository.save_cart(cart)
        )

        return CartService.serialize_cart(
            updated_cart
        )
    
    @staticmethod
    async def update_cart_item(
        user_id: str,
        request
    ):

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )

        item = next(
            (
                item
                for item in cart.items
                if item.product_id == request.product_id
            ),
            None
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in cart"
            )

        product = await (
            ProductRepository.get_product_by_id(
                request.product_id
            )
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if request.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )

        if request.quantity <= 0:

            cart.items = [
                cart_item
                for cart_item in cart.items
                if cart_item.product_id != request.product_id
            ]

        else:

            item.quantity = request.quantity

        cart.total_price = sum(
            item.price * item.quantity
            for item in cart.items
        )

        updated_cart = await (
            CartRepository.save_cart(cart)
        )

        return CartService.serialize_cart(
            updated_cart
        )
    
    @staticmethod
    async def clear_cart(
        user_id: str
    ):

        cart = await (
            CartRepository.get_cart_by_user_id(
                user_id
            )
        )

        if not cart:
            return {
                "message": "Cart already empty"
            }

        cart.items = []

        cart.total_price = 0

        updated_cart = await (
            CartRepository.save_cart(cart)
        )

        return {
            "message": "Cart cleared"
        }
    
