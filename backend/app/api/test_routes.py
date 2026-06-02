from fastapi import APIRouter

from app.models.user_model import User

router = APIRouter()


@router.post("/create-test-user")
async def create_test_user():
    user = User(
        full_name="Test User",
        email="test@example.com",
        hashed_password="hashedpassword123"
    )

    await user.insert()

    return {
        "message": "Test user created"
    }


@router.get("/users")
async def get_users():
    users = await User.find_all().to_list()

    return [
    {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }
    for user in users
]