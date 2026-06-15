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
    async def get_all_products(
        skip: int = 0,
        limit: int = 10,
        category: str | None = None,
        search: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        in_stock: bool | None = None,
        sort_by: str | None = None
    ):

        filters = {
            "is_active": True
        }

        if category:
            filters["category"] = category

        if search:
            filters["name"] = {
                "$regex": search,
                "$options": "i"
            }

        if min_price is not None or max_price is not None:

            filters["price"] = {}

            if min_price is not None:
                filters["price"]["$gte"] = min_price

            if max_price is not None:
                filters["price"]["$lte"] = max_price

        if min_rating is not None:
            filters["rating"] = {"$gte": min_rating}

        if in_stock is True:
            filters["stock"] = {"$gt": 0}

        query = Product.find(filters)

        if sort_by:
            if sort_by == "price_asc":
                query = query.sort("+price")
            elif sort_by == "price_desc":
                query = query.sort("-price")
            elif sort_by == "rating_desc":
                query = query.sort("-rating")
            elif sort_by == "newest":
                query = query.sort("-created_at")

        return await (
            query.skip(skip)
            .limit(limit)
            .to_list()
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
    
    @staticmethod
    async def add_product_image(
        product: Product,
        image_url: str
    ):

        product.images.append(image_url)

        await product.save()

        return product
    
    @staticmethod
    async def reduce_stock(
        product: Product,
        quantity: int
    ):

        product.stock -= quantity

        await product.save()

        return product
    
    @staticmethod
    async def restore_stock(
        product: Product,
        quantity: int
    ):

        product.stock += quantity

        await product.save()

        return product
    
    @staticmethod
    async def count_products(
        category: str | None = None,
        search: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        in_stock: bool | None = None
    ):

        filters = {
            "is_active": True
        }

        if category:
            filters["category"] = category

        if search:
            filters["name"] = {
                "$regex": search,
                "$options": "i"
            }

        if min_price is not None or max_price is not None:

            filters["price"] = {}

            if min_price is not None:
                filters["price"]["$gte"] = min_price

            if max_price is not None:
                filters["price"]["$lte"] = max_price

        if min_rating is not None:
            filters["rating"] = {"$gte": min_rating}

        if in_stock is True:
            filters["stock"] = {"$gt": 0}

        return await Product.find(
            filters
        ).count()