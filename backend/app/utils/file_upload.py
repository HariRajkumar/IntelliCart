import os
import uuid

from fastapi import HTTPException, UploadFile, status


ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
]

MAX_FILE_SIZE = 5 * 1024 * 1024


async def save_product_image(
    file: UploadFile
):

    if file.content_type not in ALLOWED_IMAGE_TYPES:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type"
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large"
        )

    file_extension = file.filename.split(".")[-1]

    unique_filename = (
        f"{uuid.uuid4()}.{file_extension}"
    )

    upload_path = (
        f"uploads/products/{unique_filename}"
    )

    with open(upload_path, "wb") as image_file:

        image_file.write(contents)

    return f"/uploads/products/{unique_filename}"