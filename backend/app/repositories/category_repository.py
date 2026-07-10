from app.models.category_model import Category


class CategoryRepository:

    @staticmethod
    async def create_category(
        category_data: dict
    ):

        category = Category(**category_data)

        await category.insert()

        return category

    @staticmethod
    async def get_all_categories():

        return await (
            Category.find(
                Category.is_active == True
            ).to_list()
        )

    @staticmethod
    async def get_category_by_id(
        category_id: str
    ):
        return await Category.get(category_id)

    @staticmethod
    async def update_category(
        category: Category,
        update_data: dict
    ):
        for key, value in update_data.items():
            if value is not None:
                setattr(category, key, value)
        await category.save()
        return category

    @staticmethod
    async def delete_category(
        category: Category
    ):
        await category.delete()
        return category