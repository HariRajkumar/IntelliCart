import os
import uuid

from fastapi import HTTPException, UploadFile, status


ALLOWED_IMAGE_TYPES_MAP = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"]
}

MAX_FILE_SIZE = 5 * 1024 * 1024


async def save_product_image(
    file: UploadFile
):

    if file.content_type not in ALLOWED_IMAGE_TYPES_MAP:

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

    # Validate file extension strictly against allowed content type extensions
    file_extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_extension not in ALLOWED_IMAGE_TYPES_MAP[file.content_type]:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension does not match image content type"
        )

    unique_filename = (
        f"{uuid.uuid4()}.{file_extension}"
    )

    upload_path = (
        f"uploads/products/{unique_filename}"
    )

    with open(upload_path, "wb") as image_file:

        image_file.write(contents)

    return f"/uploads/products/{unique_filename}"