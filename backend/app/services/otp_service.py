import random
from datetime import datetime, timedelta
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.models.otp_model import OTP
from app.repositories.user_repository import UserRepository
from app.utils.email import send_otp_email


class OTPService:

    @staticmethod
    async def send_otp(email: str):
        existing_user = await UserRepository.get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Generate a 6-digit random code
        otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        expiry_time = datetime.utcnow() + timedelta(
            minutes=settings.OTP_EXPIRY_MINUTES
        )

        existing_otp = await OTP.find_one(OTP.email == email)
        if existing_otp:
            existing_otp.otp = otp_code
            existing_otp.otp_expiry = expiry_time
            await existing_otp.save()
        else:
            new_otp = OTP(
                email=email,
                otp=otp_code,
                otp_expiry=expiry_time
            )
            await new_otp.insert()

        try:
            await send_otp_email(
                email,
                otp_code,
                settings.OTP_EXPIRY_MINUTES
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )

        return {
            "message": "OTP sent successfully",
            "email": email
        }

    @staticmethod
    async def resend_otp(email: str):
        existing_user = await UserRepository.get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Generate a new 6-digit random code
        otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        expiry_time = datetime.utcnow() + timedelta(
            minutes=settings.OTP_EXPIRY_MINUTES
        )

        existing_otp = await OTP.find_one(OTP.email == email)
        if existing_otp:
            existing_otp.otp = otp_code
            existing_otp.otp_expiry = expiry_time
            await existing_otp.save()
        else:
            new_otp = OTP(
                email=email,
                otp=otp_code,
                otp_expiry=expiry_time
            )
            await new_otp.insert()

        try:
            await send_otp_email(
                email,
                otp_code,
                settings.OTP_EXPIRY_MINUTES
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )

        return {
            "message": "OTP resent successfully",
            "email": email
        }

    @staticmethod
    async def verify_otp(
        email: str,
        otp: str,
        full_name: str,
        password: str
    ):
        existing_user = await UserRepository.get_user_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        otp_record = await OTP.find_one(OTP.email == email)
        if not otp_record or otp_record.otp != otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )

        if datetime.utcnow() > otp_record.otp_expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired"
            )

        # Create the new user (verified)
        hashed_pw = hash_password(password)
        new_user = await UserRepository.create_user({
            "full_name": full_name,
            "email": email,
            "hashed_password": hashed_pw,
            "is_verified": True
        })

        # Remove the OTP record
        await otp_record.delete()

        # Generate access token
        token = create_access_token({
            "sub": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role
        })

        return {
            "message": "Registration successful",
            "access_token": token,
            "token_type": "bearer"
        }
