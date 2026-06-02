from fastapi import HTTPException, status

from app.repositories.product_repository import (
    ProductRepository
)
from app.schemas.product_schema import (
    ProductCreate
)


class ProductService:

    @staticmethod
    async def create_product(
        product_data: ProductCreate
    ):

        product = await (
            ProductRepository.create_product(
                product_data.dict()
            )
        )

        return {
            "id": str(product.id),
            "name": product.name,
            "price": product.price
        }

    @staticmethod
    async def get_all_products():

        products = await (
            ProductRepository.get_all_products()
        )

        return [
            {
                "id": str(product.id),
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "stock": product.stock,
                "category": product.category,
                "images": product.images,
                "is_active": product.is_active
            }
            for product in products
        ]

    @staticmethod
    async def get_product_by_id(
        product_id: str
    ):

        product = await (
            ProductRepository.get_product_by_id(
                product_id
            )
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        return {
            "id": str(product.id),
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "category": product.category,
            "images": product.images,
            "is_active": product.is_active
        }