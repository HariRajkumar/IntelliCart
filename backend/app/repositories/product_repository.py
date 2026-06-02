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

        return await Product.find_all().to_list()

    @staticmethod
    async def get_product_by_id(
        product_id: str
    ) -> Optional[Product]:

        return await Product.get(product_id)