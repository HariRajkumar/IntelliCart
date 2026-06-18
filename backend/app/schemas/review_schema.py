from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):

    rating: int = Field(
        ...,
        ge=1,
        le=5
    )

    title: str = Field(
        default="",
        max_length=120
    )

    comment: str = Field(
        ...,
        min_length=2
    )


class ReviewResponse(BaseModel):

    id: str

    product_id: str

    user_id: str

    user_name: str

    rating: int

    title: str

    comment: str

    created_at: datetime
