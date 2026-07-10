from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user_schema import (
    UserCreate,
    UserLogin
)
from app.schemas.otp_schema import (
    SendOTPRequest,
    VerifyOTPRequest,
    OTPResponse,
    VerifyOTPFullResponse
)
from app.schemas.reset_password_schema import (
    ForgotPasswordSendOTPRequest,
    ResetPasswordConfirmRequest
)
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.services.password_reset_service import PasswordResetService


router = APIRouter()


@router.post("/register")
async def register(
    user_data: UserCreate
):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Direct registration is disabled. Please use the OTP verification flow instead."
    )



@router.post("/register/send-otp", response_model=OTPResponse)
async def send_otp(
    request: SendOTPRequest
):
    return await OTPService.send_otp(request.email)


@router.post("/register/verify-otp", response_model=VerifyOTPFullResponse)
async def verify_otp(
    request: VerifyOTPRequest
):
    return await OTPService.verify_otp(
        request.email,
        request.otp,
        request.full_name,
        request.password
    )


@router.post("/register/resend-otp", response_model=OTPResponse)
async def resend_otp(
    request: SendOTPRequest
):
    return await OTPService.resend_otp(request.email)


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    user_data = UserLogin(
        email=form_data.username,
        password=form_data.password
    )

    return await (
        AuthService.login_user(
            user_data
        )
    )


@router.post("/forgot-password/send-otp", response_model=OTPResponse)
async def forgot_password_send_otp(
    request: ForgotPasswordSendOTPRequest
):
    return await PasswordResetService.send_recovery_otp(request.email)


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordConfirmRequest
):
    return await PasswordResetService.reset_password(
        request.email,
        request.otp,
        request.new_password
    )