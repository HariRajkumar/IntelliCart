from fastapi import APIRouter

from app.schemas.user_schema import (
    UserCreate,
    UserLogin
)
from app.services.auth_service import AuthService


router = APIRouter()


@router.post("/register")
async def register(
    user_data: UserCreate
):
    return await (
        AuthService.register_user(
            user_data
        )
    )


@router.post("/login")
async def login(
    user_data: UserLogin
):
    return await (
        AuthService.login_user(
            user_data
        )
    )