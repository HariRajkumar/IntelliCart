from app.models.order_model import Order


class OrderRepository:

    @staticmethod
    async def create_order(
        order_data: dict
    ):

        order = Order(**order_data)

        await order.insert()

        return order

    @staticmethod
    async def get_orders_by_user_id(
        user_id: str
    ):

        return await (
            Order.find(
                Order.user_id == user_id
            ).to_list()
        )

    @staticmethod
    async def get_all_orders():

        return await Order.find_all().to_list()