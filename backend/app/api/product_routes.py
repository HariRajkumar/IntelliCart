# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query
# pyrefly: ignore [missing-import]
from fastapi import File, UploadFile

from app.dependencies.auth_dependencies import (
    admin_required
)
from app.models.user_model import User
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate
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
async def get_products(
    page: int = 1,
    limit: int = 10,
    category: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
    in_stock: bool | None = None,
    sort_by: str | None = None
):

    return await (
        ProductService.get_all_products(
            page=page,
            limit=limit,
            category=category,
            search=search,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            in_stock=in_stock,
            sort_by=sort_by
        )
    )


@router.get("/search")
async def search_products(
    q: str = Query(...)
):

    return await (
        ProductService.search_products(q)
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


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: User = Depends(admin_required)
):

    return await (
        ProductService.update_product(
            product_id,
            update_data
        )
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(admin_required)
):

    return await (
        ProductService.delete_product(
            product_id
        )
    )

@router.post("/{product_id}/upload-image")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(admin_required)
):

    return await (
        ProductService.upload_product_image(
            product_id,
            file
        )
    )