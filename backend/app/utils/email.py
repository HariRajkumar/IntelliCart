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


# ---------------------------------------------------------------------------
# Order Confirmation Email
# ---------------------------------------------------------------------------

def send_order_confirmation_email_sync(
    to_email: str,
    customer_name: str,
    order
) -> None:
    """Send a rich HTML invoice email to the customer after a successful checkout."""

    short_id = str(order.id)[-8:].upper()
    order_date = order.created_at.strftime("%d %B %Y, %I:%M %p")

    # Build items table rows
    item_rows = ""
    for item in order.items:
        line_total = item.price * item.quantity
        item_rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">{item.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:center;">{item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;text-align:right;">&#8377;{item.price:,.2f}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#1f2937;text-align:right;">&#8377;{line_total:,.2f}</td>
        </tr>"""

    # Shipping address block
    addr = order.shipping_address
    addr_html = ""
    if addr:
        addr_html = f"{addr.address_line}, {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}"

    # Pre-compute shipping section (avoids nested f-string)
    addr_section = ""
    if addr_html:
        addr_section = f"""
      <div style="margin-bottom:28px;">
        <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Shipping To</h3>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">{addr_html}</p>
      </div>"""

    # Payment method badge colour
    method = (order.payment_method or "cod").upper()
    badge_colors = {"COD": "#f59e0b", "CARD": "#6366f1", "UPI": "#10b981"}
    badge_color = badge_colors.get(method, "#6b7280")

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:620px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:36px 30px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;text-align:center;line-height:56px;">
        <span style="font-size:26px;color:#ffffff;vertical-align:middle;">&#10003;</span>
      </div>
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Order Confirmed!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for shopping with IntelliCart</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 30px;">
      <p style="margin:0 0 6px;font-size:15px;color:#1f2937;">Hello, <strong>{customer_name}</strong>!</p>
      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
        Great news — we've received your order and it's being processed. Here's your invoice summary:
      </p>

      <!-- Order Meta -->
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
        <tr>
          <td style="padding:16px 20px;vertical-align:top;width:33%;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Order ID</p>
            <p style="margin:6px 0 0;font-size:15px;font-weight:800;color:#4f46e5;">#{short_id}</p>
          </td>
          <td style="padding:16px 20px;vertical-align:top;width:34%;border-left:1px solid #e5e7eb;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Order Date</p>
            <p style="margin:6px 0 0;font-size:13px;font-weight:600;color:#374151;">{order_date}</p>
          </td>
          <td style="padding:16px 20px;vertical-align:top;width:33%;border-left:1px solid #e5e7eb;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Payment</p>
            <span style="display:inline-block;margin-top:6px;padding:4px 12px;background:{badge_color};color:#fff;font-size:11px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">{method}</span>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <h3 style="margin:0 0 14px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;border-bottom:2px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>{item_rows}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
        <tr>
          <td style="padding:14px 20px 8px 20px;font-size:13px;color:#6b7280;">Subtotal</td>
          <td style="padding:14px 20px 8px 20px;font-size:13px;font-weight:600;color:#374151;text-align:right;">&#8377;{order.total_price:,.2f}</td>
        </tr>
        <tr>
          <td style="padding:8px 20px;font-size:13px;color:#6b7280;">Delivery</td>
          <td style="padding:8px 20px;font-size:13px;font-weight:700;color:#10b981;text-align:right;">FREE</td>
        </tr>
        <tr style="border-top:2px solid #e5e7eb;">
          <td style="padding:14px 20px;font-size:15px;font-weight:800;color:#1f2937;">Grand Total</td>
          <td style="padding:14px 20px;font-size:17px;font-weight:900;color:#4f46e5;text-align:right;">&#8377;{order.total_price:,.2f}</td>
        </tr>
      </table>

      <!-- Shipping Address -->
      {addr_section}

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:10px;">
        <a href="http://localhost:5173/orders"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          Track Your Order
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:22px 30px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; 2026 IntelliCart. All rights reserved.</p>
      <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">You're receiving this email because you placed an order with us.</p>
    </div>

  </div>
</body>
</html>"""

    plain = (
        f"Hello {customer_name},\n\n"
        f"Your IntelliCart order #{short_id} has been confirmed!\n\n"
        f"Order Date: {order_date}\n"
        f"Grand Total: Rs. {order.total_price:,.2f}\n\n"
        f"Track your order at: http://localhost:5173/orders\n\n"
        f"Thank you for shopping with IntelliCart!\n"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your IntelliCart Order #{short_id} is Confirmed!"
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())


async def send_order_confirmation_email(
    to_email: str,
    customer_name: str,
    order
) -> None:
    await asyncio.to_thread(
        send_order_confirmation_email_sync, to_email, customer_name, order
    )


# ---------------------------------------------------------------------------
# Logistics / Status Update Email
# ---------------------------------------------------------------------------

def send_logistics_update_email_sync(
    to_email: str,
    customer_name: str,
    order_id: str,
    new_status: str
) -> None:
    """Send a status-adaptive email to the customer when an order is shipped,
    delivered, or cancelled."""

    short_id = order_id[-8:].upper()
    status_lower = new_status.lower() if hasattr(new_status, "lower") else str(new_status).lower()

    # Per-status configurations
    if status_lower == "shipped":
        subject = f"Your IntelliCart Order #{short_id} is On its Way! 🚚"
        header_gradient = "linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)"
        hero_icon = "🚚"
        headline = "Your Order is Shipped!"
        subheadline = "Your package is on its way to you."
        body_html = f"""
          <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
            Great news, <strong>{customer_name}</strong>! Your IntelliCart order
            <strong style="color:#0284c7;">#{short_id}</strong> has been dispatched
            and is now with our delivery partner.
          </p>
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0284c7;">📦 What happens next?</p>
            <ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.8;">
              <li>Your package is en route to your shipping address.</li>
              <li>Expected delivery within <strong>2–5 business days</strong>.</li>
              <li>You can track the status in your Orders page.</li>
            </ul>
          </div>"""
        cta_label = "Track Your Order"
        cta_color = "#0284c7"
        cta_gradient = "linear-gradient(135deg,#0ea5e9,#0284c7)"

    elif status_lower == "delivered":
        subject = f"Your IntelliCart Order #{short_id} has been Delivered! 🎉"
        header_gradient = "linear-gradient(135deg,#10b981 0%,#059669 100%)"
        hero_icon = "🎉"
        headline = "Order Delivered!"
        subheadline = "We hope you love your purchase."
        body_html = f"""
          <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
            Hi <strong>{customer_name}</strong>! Your IntelliCart order
            <strong style="color:#059669;">#{short_id}</strong> has been successfully
            delivered. We hope everything arrived in perfect condition!
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#059669;">💬 Enjoyed your purchase?</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">
              Share your experience by leaving a review on the product page — it helps
              other shoppers make confident choices!
            </p>
          </div>"""
        cta_label = "Leave a Review"
        cta_color = "#059669"
        cta_gradient = "linear-gradient(135deg,#10b981,#059669)"

    else:  # cancelled
        subject = f"Your IntelliCart Order #{short_id} has been Cancelled"
        header_gradient = "linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)"
        hero_icon = "❌"
        headline = "Order Cancelled"
        subheadline = "Your order has been cancelled."
        body_html = f"""
          <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
            Hi <strong>{customer_name}</strong>, your IntelliCart order
            <strong style="color:#e11d48;">#{short_id}</strong> has been cancelled.
            We're sorry for any inconvenience this may cause.
          </p>
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#e11d48;">💳 Refund Information</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">
              If you paid online, your refund will be processed to the original payment
              method within <strong>5–7 business days</strong>. For Cash on Delivery
              orders, no charge was made.
            </p>
          </div>"""
        cta_label = "Browse Products"
        cta_color = "#e11d48"
        cta_gradient = "linear-gradient(135deg,#f43f5e,#e11d48)"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:620px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:{header_gradient};padding:36px 30px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">{hero_icon}</div>
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">{headline}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">{subheadline}</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 30px;">
      {body_html}

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:8px;">
        <a href="http://localhost:5173/orders"
           style="display:inline-block;padding:14px 36px;background:{cta_gradient};color:#ffffff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
          {cta_label}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:22px 30px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; 2026 IntelliCart. All rights reserved.</p>
      <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">Order reference: #{short_id}</p>
    </div>

  </div>
</body>
</html>"""

    plain = (
        f"Hello {customer_name},\n\n"
        f"Your IntelliCart order #{short_id} status update: {status_lower.upper()}.\n\n"
        f"View your orders at: http://localhost:5173/orders\n\n"
        f"Thank you for shopping with IntelliCart!\n"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())


async def send_logistics_update_email(
    to_email: str,
    customer_name: str,
    order_id: str,
    new_status: str
) -> None:
    await asyncio.to_thread(
        send_logistics_update_email_sync, to_email, customer_name, order_id, new_status
    )
