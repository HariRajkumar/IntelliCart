from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import (
    admin_required
)
from app.models.user_model import User
from app.schemas.product_schema import (
    ProductCreate
)
from app.services.product_service import (
    ProductService
)


router = APIRouter()


@router.post("/")
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(admin_required)
):

    return await (
        ProductService.create_product(
            product_data
        )
    )


@router.get("/")
async def get_products():

    return await (
        ProductService.get_all_products()
    )


@router.get("/{product_id}")
async def get_product(
    product_id: str
):

    return await (
        ProductService.get_product_by_id(
            product_id
        )
    )