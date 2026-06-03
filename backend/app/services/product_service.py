from fastapi import HTTPException, status

from app.repositories.product_repository import (
    ProductRepository
)
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate
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
    async def get_all_products(
        page: int = 1,
        limit: int = 10,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None
    ):

        skip = (page - 1) * limit

        products = await (
            ProductRepository.get_all_products(
                skip=skip,
                limit=limit,
                category=category,
                min_price=min_price,
                max_price=max_price
            )
        )

        return [
            ProductService.serialize_product(product)
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

        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        return ProductService.serialize_product(product)

    @staticmethod
    async def update_product(
        product_id: str,
        update_data: ProductUpdate
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

        updated_product = await (
            ProductRepository.update_product(
                product,
                update_data.dict(exclude_unset=True)
            )
        )

        return ProductService.serialize_product(
            updated_product
        )

    @staticmethod
    async def delete_product(
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

        await (
            ProductRepository.soft_delete_product(
                product
            )
        )

        return {
            "message": "Product deleted successfully"
        }

    @staticmethod
    async def search_products(
        query: str
    ):

        products = await (
            ProductRepository.search_products(
                query
            )
        )

        return [
            ProductService.serialize_product(product)
            for product in products
        ]

    @staticmethod
    def serialize_product(product):

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