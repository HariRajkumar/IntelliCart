from app.repositories.category_repository import (
    CategoryRepository
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