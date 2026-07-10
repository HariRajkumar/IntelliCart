from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.models.schemas import ChatRequest, ChatResponse, ChatHistoryResponse, ClearHistoryResponse, MessageSchema
from app.services.chatbot_service import ChatbotService
from app.memory.chat_history import MongoChatHistory
from app.utils.config import settings
from app.utils.logger import logger

router = APIRouter()
security = HTTPBearer()
chatbot_service = ChatbotService()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        role = payload.get("role")
        email = payload.get("email")
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims"
            )
        return {
            "user_id": user_id,
            "role": role,
            "email": email
        }
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    role = current_user["role"]
    response_text = await chatbot_service.process_chat(user_id, role, request.prompt)
    return ChatResponse(response=response_text)

@router.get("/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    history = await MongoChatHistory.get_history(user_id)
    formatted_history = [
        MessageSchema(
            role=msg["role"],
            content=msg["content"],
            timestamp=str(msg["timestamp"])
        )
        for msg in history
    ]
    return ChatHistoryResponse(history=formatted_history)

@router.delete("/chat/history", response_model=ClearHistoryResponse)
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    await MongoChatHistory.clear_history(user_id)
    return ClearHistoryResponse(message="Chat history cleared successfully")
