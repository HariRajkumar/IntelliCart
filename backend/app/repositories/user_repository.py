from typing import Optional

from app.models.user_model import User


class UserRepository:

    @staticmethod
    async def get_user_by_email(
        email: str
    ) -> Optional[User]:
        return await User.find_one(
            User.email == email
        )

    @staticmethod
    async def create_user(
        user_data: dict
    ) -> User:
        user = User(**user_data)

        await user.insert()

        return user