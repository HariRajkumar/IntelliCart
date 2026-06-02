from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

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
    form_data: OAuth2PasswordRequestForm = Depends()
):

    user_data = UserLogin(
        email=form_data.username,
        password=form_data.password
    )

    return await (
        AuthService.login_user(
            user_data
        )
    )