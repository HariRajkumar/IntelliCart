# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import (
    admin_required
)
from app.models.user_model import User
from app.schemas.category_schema import (
    CategoryCreate
)
from app.services.category_service import (
    CategoryService
)


router = APIRouter()


@router.post("/")
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(admin_required)
):

    return await (
        CategoryService.create_category(
            category_data
        )
    )


@router.get("/")
async def get_categories():

    return await (
        CategoryService.get_all_categories()
    )