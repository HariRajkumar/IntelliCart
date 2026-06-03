from datetime import datetime

from beanie import Document
from pydantic import Field


class Category(Document):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    description: str = Field(
        default=""
    )

    is_active: bool = True

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "categories"