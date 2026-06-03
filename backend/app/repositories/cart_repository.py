from app.models.cart_model import Cart


class CartRepository:

    @staticmethod
    async def get_cart_by_user_id(
        user_id: str
    ):

        return await Cart.find_one(
            Cart.user_id == user_id
        )

    @staticmethod
    async def create_cart(
        cart_data: dict
    ):

        cart = Cart(**cart_data)

        await cart.insert()

        return cart

    @staticmethod
    async def save_cart(
        cart: Cart
    ):

        await cart.save()

        return cart
    
    @staticmethod
    async def delete_cart(
        cart: Cart
    ):

        await cart.delete()