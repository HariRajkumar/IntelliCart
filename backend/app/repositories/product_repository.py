from typing import Optional

from app.models.product_model import Product


class ProductRepository:

    @staticmethod
    async def create_product(
        product_data: dict
    ) -> Product:

        product = Product(**product_data)

        await product.insert()

        return product

    @staticmethod
    async def get_all_products():

        return await (
            Product.find(
                Product.is_active == True
            ).to_list()
        )

    @staticmethod
    async def get_product_by_id(
        product_id: str
    ) -> Optional[Product]:

        return await Product.get(product_id)

    @staticmethod
    async def update_product(
        product: Product,
        update_data: dict
    ):

        for key, value in update_data.items():

            if value is not None:
                setattr(product, key, value)

        await product.save()

        return product

    @staticmethod
    async def soft_delete_product(
        product: Product
    ):

        product.is_active = False

        await product.save()

        return product

    @staticmethod
    async def search_products(
        query: str
    ):

        return await (
            Product.find(
                {
                    "$or": [
                        {
                            "name": {
                                "$regex": query,
                                "$options": "i"
                            }
                        },
                        {
                            "category": {
                                "$regex": query,
                                "$options": "i"
                            }
                        }
                    ],
                    "is_active": True
                }
            ).to_list()
        )