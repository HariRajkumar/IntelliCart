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