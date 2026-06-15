import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_otp_email_sync(to_email: str, otp: str, expiry_minutes: int) -> None:
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }}
    .header h1 {{
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .content {{
      padding: 40px 30px;
      color: #1f2937;
      line-height: 1.6;
    }}
    .otp-container {{
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 30px 0;
    }}
    .otp-code {{
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #4f46e5;
      margin: 0;
    }}
    .footer {{
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #f3f4f6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to IntelliCart</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for choosing IntelliCart! To complete your registration, please verify your email address using the following One-Time Password (OTP):</p>
      <div class="otp-container">
        <h2 class="otp-code">{otp}</h2>
      </div>
      <p>This code is valid for <strong>{expiry_minutes} minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 IntelliCart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
"""

    message = MIMEMultipart("alternative")
    message["Subject"] = f"{otp} is your IntelliCart verification code"
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    # Plain text version for better client support and lower spam ratings
    text_content = f"Welcome to IntelliCart!\n\nYour 6-digit verification code is: {otp}\n\nThis code is valid for {expiry_minutes} minutes. If you did not request this, please ignore this email."
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")

    # The client will render the last part it supports (HTML) but has plain text fallback
    message.attach(part1)
    message.attach(part2)

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())


async def send_otp_email(to_email: str, otp: str, expiry_minutes: int) -> None:
    await asyncio.to_thread(send_otp_email_sync, to_email, otp, expiry_minutes)


def send_reset_password_email_sync(to_email: str, otp: str, expiry_minutes: int) -> None:
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }}
    .header h1 {{
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .content {{
      padding: 40px 30px;
      color: #1f2937;
      line-height: 1.6;
    }}
    .otp-container {{
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 30px 0;
    }}
    .otp-code {{
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #d97706;
      margin: 0;
    }}
    .footer {{
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #f3f4f6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your IntelliCart password. Please use the following One-Time Password (OTP) to complete the process:</p>
      <div class="otp-container">
        <h2 class="otp-code">{otp}</h2>
      </div>
      <p>This code is valid for <strong>{expiry_minutes} minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 IntelliCart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
"""

    message = MIMEMultipart("alternative")
    message["Subject"] = f"{otp} is your IntelliCart password reset code"
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    # Plain text version
    text_content = f"Reset your IntelliCart password!\n\nYour 6-digit password reset code is: {otp}\n\nThis code is valid for {expiry_minutes} minutes. If you did not request this, please ignore this email."
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")

    message.attach(part1)
    message.attach(part2)

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())


async def send_reset_password_email(to_email: str, otp: str, expiry_minutes: int) -> None:
    await asyncio.to_thread(send_reset_password_email_sync, to_email, otp, expiry_minutes)

