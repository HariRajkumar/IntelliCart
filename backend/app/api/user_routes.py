# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from typing import List

from app.dependencies.auth_dependencies import (
    get_current_user
)
from app.models.user_model import User
from app.services.user_service import UserService
from app.schemas.user_schema import (
    UserResponse,
    UserProfileUpdate,
    UserPasswordChange,
    UserAddressCreate,
    UserAddressUpdate,
    UserAddressResponse
)


router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return UserService.serialize_user(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    return await UserService.update_profile(current_user, update_data)


@router.post("/change-password")
async def change_password(
    password_data: UserPasswordChange,
    current_user: User = Depends(get_current_user)
):
    return await UserService.change_password(current_user, password_data)


@router.post("/addresses", response_model=List[UserAddressResponse])
async def add_address(
    address_data: UserAddressCreate,
    current_user: User = Depends(get_current_user)
):
    return await UserService.add_address(current_user, address_data)


@router.put("/addresses/{address_id}", response_model=List[UserAddressResponse])
async def update_address(
    address_id: str,
    address_data: UserAddressUpdate,
    current_user: User = Depends(get_current_user)
):
    return await UserService.update_address(current_user, address_id, address_data)


@router.delete("/addresses/{address_id}", response_model=List[UserAddressResponse])
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    return await UserService.delete_address(current_user, address_id)