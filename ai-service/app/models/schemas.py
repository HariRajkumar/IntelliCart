from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

class MessageSchema(BaseModel):
    role: str
    content: str
    timestamp: str

class ChatHistoryResponse(BaseModel):
    history: List[MessageSchema]

class ClearHistoryResponse(BaseModel):
    message: str
