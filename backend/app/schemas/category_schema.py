from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: str = ""


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: str