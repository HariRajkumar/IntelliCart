from pydantic import BaseModel, EmailStr


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    full_name: str
    password: str


class OTPResponse(BaseModel):
    message: str
    email: EmailStr


class VerifyOTPFullResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
