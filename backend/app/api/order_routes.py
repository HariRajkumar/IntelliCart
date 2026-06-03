from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import (
    admin_required,
    get_current_user
)
from app.models.user_model import User
from app.services.order_service import (
    OrderService
)


router = APIRouter()


@router.post("/checkout")
async def checkout(
    current_user: User = Depends(get_current_user)
):

    return await (
        OrderService.checkout(
            str(current_user.id)
        )
    )


@router.get("/my-orders")
async def get_my_orders(
    current_user: User = Depends(get_current_user)
):

    return await (
        OrderService.get_my_orders(
            str(current_user.id)
        )
    )


@router.get("/")
async def get_all_orders(
    current_user: User = Depends(admin_required)
):

    return await (
        OrderService.get_all_orders()
    )