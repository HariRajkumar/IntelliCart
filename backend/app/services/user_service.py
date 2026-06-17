from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password
from app.models.user_model import User, UserAddress
from app.schemas.user_schema import (
    UserProfileUpdate,
    UserPasswordChange,
    UserAddressCreate,
    UserAddressUpdate
)


class UserService:

    @staticmethod
    def serialize_user(user: User) -> dict:
        return {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "phone_number": user.phone_number,
            "addresses": [
                {
                    "id": addr.id,
                    "address_line": addr.address_line,
                    "city": addr.city,
                    "state": addr.state,
                    "postal_code": addr.postal_code,
                    "country": addr.country,
                    "is_default": addr.is_default
                }
                for addr in user.addresses
            ],
            "created_at": user.created_at
        }

    @staticmethod
    async def update_profile(user: User, update_data: UserProfileUpdate) -> dict:
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.phone_number is not None:
            user.phone_number = update_data.phone_number

        await user.save()
        return UserService.serialize_user(user)

    @staticmethod
    async def change_password(user: User, password_data: UserPasswordChange) -> dict:
        if not verify_password(password_data.old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )

        if password_data.old_password == password_data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )

        user.hashed_password = hash_password(password_data.new_password)
        await user.save()
        return {"message": "Password changed successfully"}

    @staticmethod
    async def add_address(user: User, address_data: UserAddressCreate) -> list:
        # Create a new address object (auto-generates UUID)
        new_address = UserAddress(
            address_line=address_data.address_line,
            city=address_data.city,
            state=address_data.state,
            postal_code=address_data.postal_code,
            country=address_data.country,
            is_default=address_data.is_default
        )

        # Handle default constraints
        if not user.addresses:
            new_address.is_default = True
        elif new_address.is_default:
            for addr in user.addresses:
                addr.is_default = False

        user.addresses.append(new_address)
        await user.save()
        return UserService.serialize_user(user)["addresses"]

    @staticmethod
    async def update_address(user: User, address_id: str, address_data: UserAddressUpdate) -> list:
        address_to_update = None
        for addr in user.addresses:
            if addr.id == address_id:
                address_to_update = addr
                break

        if not address_to_update:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )

        # Update fields if provided
        if address_data.address_line is not None:
            address_to_update.address_line = address_data.address_line
        if address_data.city is not None:
            address_to_update.city = address_data.city
        if address_data.state is not None:
            address_to_update.state = address_data.state
        if address_data.postal_code is not None:
            address_to_update.postal_code = address_data.postal_code
        if address_data.country is not None:
            address_to_update.country = address_data.country
        
        if address_data.is_default is not None:
            address_to_update.is_default = address_data.is_default

        # Adjust defaults
        if len(user.addresses) == 1:
            address_to_update.is_default = True
        elif address_to_update.is_default:
            for addr in user.addresses:
                if addr.id != address_id:
                    addr.is_default = False

        await user.save()
        return UserService.serialize_user(user)["addresses"]

    @staticmethod
    async def delete_address(user: User, address_id: str) -> list:
        address_to_delete = None
        for addr in user.addresses:
            if addr.id == address_id:
                address_to_delete = addr
                break

        if not address_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )

        was_default = address_to_delete.is_default
        user.addresses = [addr for addr in user.addresses if addr.id != address_id]

        # If we deleted the default address and have other addresses left, make the first one default
        if was_default and user.addresses:
            user.addresses[0].is_default = True

        await user.save()
        return UserService.serialize_user(user)["addresses"]
