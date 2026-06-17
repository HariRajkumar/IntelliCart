from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user_model import User
from app.models.product_model import Product
from app.models.category_model import Category
from app.models.cart_model import Cart
from app.models.order_model import Order
from app.models.otp_model import OTP


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)

    await init_beanie(
        database=db.client[settings.DATABASE_NAME],
        document_models=[
            User,
            Product,
            Category,
            Cart,
            Order,
            OTP
        ]
    )

    print("Connected to MongoDB")

    # Seed default admin user if not present
    try:
        from app.core.roles import UserRole
        from app.core.security import hash_password
        
        admin_user = await User.find_one(User.role == UserRole.ADMIN)
        if not admin_user:
            hashed_pw = hash_password("admin123")
            new_admin = User(
                full_name="IntelliCart Admin",
                email="admin@intellicart.com",
                hashed_password=hashed_pw,
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            )
            await new_admin.insert()
            print("Seeded default admin user: admin@intellicart.com")
    except Exception as e:
        print(f"Failed to seed default admin user: {e}")

    # Backfill migration for existing products missing new UI/UX fields
    try:
        products = await Product.find_all().to_list()
        updated_count = 0
        for p in products:
            needs_save = False
            if getattr(p, "mrp", None) is None:
                # Set MRP to 1.25x the current price (rounded)
                p.mrp = round(p.price * 1.25, 2)
                # discount = ((mrp - price) / mrp) * 100
                p.discount = round(((p.mrp - p.price) / p.mrp) * 100, 1)
                needs_save = True

            if getattr(p, "rating", 0.0) == 0.0:
                # Stable rating calculation based on product name
                name_sum = sum(ord(c) for c in p.name)
                rating_val = round(4.0 + (name_sum % 10) / 10, 1)
                p.rating = min(5.0, max(1.0, rating_val))
                needs_save = True

            if getattr(p, "reviews_count", 0) == 0:
                name_sum = sum(ord(c) for c in p.name)
                p.reviews_count = (name_sum % 230) + 15
                needs_save = True

            # Backfill multiple images for Keyboard and Laptop
            pid_str = str(p.id)
            if pid_str == "6a1ec1d40d4741f269ea9144":
                img2 = "/uploads/products/6a1ec1d40d4741f269ea9144_2.png"
                img3 = "/uploads/products/6a1ec1d40d4741f269ea9144_3.png"
                if img2 not in p.images:
                    p.images.append(img2)
                    needs_save = True
                if img3 not in p.images:
                    p.images.append(img3)
                    needs_save = True
            elif pid_str == "6a23c4ff14d9fd3a9e72d7af":
                img2 = "/uploads/products/6a23c4ff14d9fd3a9e72d7af_2.png"
                img3 = "/uploads/products/6a23c4ff14d9fd3a9e72d7af_3.png"
                if img2 not in p.images:
                    p.images.append(img2)
                    needs_save = True
                if img3 not in p.images:
                    p.images.append(img3)
                    needs_save = True

            if getattr(p, "seller_name", None) is None:
                p.seller_name = "IntelliCart Central Hub"
                needs_save = True

            if getattr(p, "seller_postal_code", None) is None:
                p.seller_postal_code = "400001"
                needs_save = True

            if needs_save:
                await p.save()
                updated_count += 1
        
        if updated_count > 0:
            print(f"Backfill migration: updated {updated_count} products with MRP, ratings, and reviews.")
    except Exception as e:
        print(f"Failed to backfill products: {e}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")