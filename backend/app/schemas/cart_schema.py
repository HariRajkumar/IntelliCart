from pydantic import BaseModel


class AddToCartRequest(BaseModel):

    product_id: str

    quantity: int = 1