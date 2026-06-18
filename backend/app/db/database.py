from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user_model import User
from app.models.product_model import Product
from app.models.category_model import Category
from app.models.cart_model import Cart
from app.models.order_model import Order
from app.models.otp_model import OTP
from app.models.review_model import Review


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
            OTP,
            Review
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


    # Seed mock reviews for products that have no reviews yet
    try:
        from datetime import datetime, timedelta
        mock_reviews_data = [
            {
                "user_id": "mock_user_1",
                "user_name": "Rajesh Kumar",
                "rating": 5,
                "title": "Absolutely worth the price!",
                "comment": "Build quality is top notch. Visual styles are premium and feel extremely tactile. Highly recommend purchasing this if you are a coder or developer.",
                "days_ago": 6
            },
            {
                "user_id": "mock_user_2",
                "user_name": "Siddharth S.",
                "rating": 4,
                "title": "Great product, solid construction",
                "comment": "Exceeded my expectations. Packaging was safe, and shipping was prompt. Very premium feel. Only minor issue is the cord layout could be a bit cleaner.",
                "days_ago": 21
            },
            {
                "user_id": "mock_user_3",
                "user_name": "Nisha J.",
                "rating": 4,
                "title": "Decent performance, very pretty",
                "comment": "Looks exactly like the product photos. Color scheme and aesthetics fit my room setup perfectly. Smooth interactions.",
                "days_ago": 45
            },
        ]
        all_products = await Product.find_all().to_list()
        seeded_review_count = 0
        for p in all_products:
            existing_count = await Review.find(Review.product_id == str(p.id)).count()
            if existing_count == 0:
                for mock in mock_reviews_data:
                    review_ts = datetime.utcnow() - timedelta(days=mock["days_ago"])
                    rev = Review(
                        product_id=str(p.id),
                        user_id=mock["user_id"],
                        user_name=mock["user_name"],
                        rating=mock["rating"],
                        title=mock["title"],
                        comment=mock["comment"],
                        created_at=review_ts,
                        updated_at=review_ts,
                    )
                    await rev.insert()
                    seeded_review_count += 1
                # Recalculate aggregates from seeded reviews
                all_reviews = await Review.find(Review.product_id == str(p.id)).to_list()
                p.reviews_count = len(all_reviews)
                p.rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)
                await p.save()
        if seeded_review_count > 0:
            print(f"Seeded {seeded_review_count} mock reviews across {len(all_products)} products.")
    except Exception as e:
        print(f"Failed to seed mock reviews: {e}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")