# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import (
    get_current_user
)
from app.models.user_model import User


router = APIRouter()


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }