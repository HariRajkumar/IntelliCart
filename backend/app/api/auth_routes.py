from fastapi import APIRouter, Depends
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
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService


router = APIRouter()


@router.post("/register")
async def register(
    user_data: UserCreate
):
    return await (
        AuthService.register_user(
            user_data
        )
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