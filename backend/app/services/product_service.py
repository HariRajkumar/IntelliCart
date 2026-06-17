from fastapi import HTTPException, status
from fastapi import UploadFile

from app.utils.file_upload import (
    save_product_image
)
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
        search: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        in_stock: bool | None = None,
        sort_by: str | None = None
    ):

        skip = (page - 1) * limit

        products = await (
            ProductRepository.get_all_products(
                skip=skip,
                limit=limit,
                category=category,
                search=search,
                min_price=min_price,
                max_price=max_price,
                min_rating=min_rating,
                in_stock=in_stock,
                sort_by=sort_by
            )
        )

        total = await (
            ProductRepository.count_products(
                category=category,
                search=search,
                min_price=min_price,
                max_price=max_price,
                min_rating=min_rating,
                in_stock=in_stock
            )
        )

        return {
            "items": [
                ProductService.serialize_product(product)
                for product in products
            ],
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (
                total + limit - 1
            ) // limit
        }

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
            "is_active": product.is_active,
            "mrp": getattr(product, "mrp", None),
            "discount": getattr(product, "discount", 0.0),
            "rating": getattr(product, "rating", 0.0),
            "reviews_count": getattr(product, "reviews_count", 0),
            "seller_name": getattr(product, "seller_name", "IntelliCart Central Hub"),
            "seller_postal_code": getattr(product, "seller_postal_code", "400001")
        }

    @staticmethod
    async def calculate_delivery_estimate(product_id: str, postal_code: str):
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

        origin = getattr(product, "seller_postal_code", "400001")
        seller_name = getattr(product, "seller_name", "IntelliCart Central Hub")

        origin_clean = "".join(c for c in origin if c.isalnum()).strip()
        dest_clean = "".join(c for c in postal_code if c.isalnum()).strip()

        if not dest_clean:
            min_days, max_days = 3, 5
        elif origin_clean == dest_clean:
            min_days, max_days = 1, 1
        elif len(origin_clean) >= 3 and len(dest_clean) >= 3 and origin_clean[:3] == dest_clean[:3]:
            min_days, max_days = 1, 2
        elif len(origin_clean) >= 1 and len(dest_clean) >= 1 and origin_clean[0] == dest_clean[0]:
            min_days, max_days = 2, 3
        else:
            min_days, max_days = 4, 5

        from datetime import datetime, timedelta
        today = datetime.now()
        min_delivery_date = today + timedelta(days=min_days)
        max_delivery_date = today + timedelta(days=max_days)

        min_date_str = min_delivery_date.strftime("%A, %b %d")
        max_date_str = max_delivery_date.strftime("%A, %b %d")

        if min_days == max_days:
            delivery_date_range = min_date_str
        else:
            delivery_date_range = f"{min_date_str} to {max_date_str}"

        return {
            "product_id": product_id,
            "origin_postal_code": origin,
            "destination_postal_code": postal_code,
            "seller_name": seller_name,
            "min_days": min_days,
            "max_days": max_days,
            "delivery_date_range": delivery_date_range
        }
    
    @staticmethod
    async def upload_product_image(
        product_id: str,
        file: UploadFile
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

        image_url = await (
            save_product_image(file)
        )

        updated_product = await (
            ProductRepository.add_product_image(
                product,
                image_url
            )
        )

        return ProductService.serialize_product(
            updated_product
        )