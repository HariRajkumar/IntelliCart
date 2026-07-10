# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends

from app.dependencies.auth_dependencies import (
    get_current_user
)
from app.models.user_model import User
from app.schemas.cart_schema import (
    AddToCartRequest,
    UpdateCartItemRequest
)
from app.services.cart_service import (
    CartService
)


router = APIRouter()


@router.post("/add")
async def add_to_cart(
    request: AddToCartRequest,
    current_user: User = Depends(get_current_user)
):

    return await (
        CartService.add_to_cart(
            str(current_user.id),
            request
        )
    )


@router.get("/")
async def get_cart(
    current_user: User = Depends(get_current_user)
):

    return await (
        CartService.get_cart(
            str(current_user.id)
        )
    )

@router.put("/update")
async def update_cart_item(
    request: UpdateCartItemRequest,
    current_user: User = Depends(get_current_user)
):

    return await (
        CartService.update_cart_item(
            str(current_user.id),
            request
        )
    )

@router.delete("/remove/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user)
):

    return await (
        CartService.remove_from_cart(
            str(current_user.id),
            product_id
        )
    )

@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user)
):

    return await (
        CartService.clear_cart(
            str(current_user.id)
        )
    )