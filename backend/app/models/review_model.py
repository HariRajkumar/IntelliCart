from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field


class Review(Document):

    product_id: str

    user_id: str

    user_name: str

    rating: int = Field(
        ...,
        ge=1,
        le=5
    )

    title: str = Field(default="")

    comment: str = Field(
        ...,
        min_length=2
    )

    verified_purchase: bool = Field(
        default=False
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "reviews"
