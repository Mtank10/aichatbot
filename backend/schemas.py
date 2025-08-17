from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True