from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import (
    UserCreate,
    UserLogin
)


class AuthService:

    @staticmethod
    async def register_user(
        user_data: UserCreate
    ):

        existing_user = await (
            UserRepository.get_user_by_email(
                user_data.email
            )
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_pw = hash_password(
            user_data.password
        )

        new_user = await (
            UserRepository.create_user(
                {
                    "full_name": user_data.full_name,
                    "email": user_data.email,
                    "hashed_password": hashed_pw
                }
            )
        )

        return {
            "id": str(new_user.id),
            "email": new_user.email
        }

    @staticmethod
    async def login_user(
        user_data: UserLogin
    ):

        user = await (
            UserRepository.get_user_by_email(
                user_data.email
            )
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        valid_password = verify_password(
            user_data.password,
            user.hashed_password
        )

        if not valid_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }