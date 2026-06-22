from fastapi import HTTPException, status
from app.repositories.category_repository import (
    CategoryRepository
)
from app.repositories.product_repository import (
    ProductRepository
)
from app.schemas.category_schema import (
    CategoryCreate
)


class CategoryService:

    @staticmethod
    async def create_category(
        category_data: CategoryCreate
    ):

        category = await (
            CategoryRepository.create_category(
                category_data.dict()
            )
        )

        return {
            "id": str(category.id),
            "name": category.name,
            "description": category.description
        }

    @staticmethod
    async def get_all_categories():

        categories = await (
            CategoryRepository.get_all_categories()
        )

        return [
            {
                "id": str(category.id),
                "name": category.name,
                "description": category.description
            }
            for category in categories
        ]

    @staticmethod
    async def update_category(
        category_id: str,
        category_data: CategoryCreate
    ):
        category = await CategoryRepository.get_category_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        old_name = category.name
        new_name = category_data.name

        # Cascade category rename to products
        if old_name != new_name:
            await ProductRepository.update_product_categories(old_name, new_name)

        updated_category = await CategoryRepository.update_category(
            category,
            category_data.dict(exclude_unset=True)
        )

        return {
            "id": str(updated_category.id),
            "name": updated_category.name,
            "description": updated_category.description
        }

    @staticmethod
    async def delete_category(
        category_id: str
    ):
        category = await CategoryRepository.get_category_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        # Cascade category deletion to products (reassign to Uncategorized)
        await ProductRepository.reassign_category_to_uncategorized(category.name)

        await CategoryRepository.delete_category(category)

        return {
            "message": f"Category '{category.name}' deleted successfully, and associated products reassigned to 'Uncategorized'"
        }