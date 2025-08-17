from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
import httpx
import json
import asyncio
from typing import AsyncGenerator
import uuid
from datetime import datetime

from database import get_db, engine
from models import Chat, Message
from schemas import ChatCreate, MessageCreate, ChatResponse, MessageResponse
import models

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Chatbot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active streaming sessions
active_streams = {}

@app.get("/")
async def root():
    return {"message": "AI Chatbot API is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def create_chat(db: Session = Depends(get_db)):
    """Create a new chat session"""
    try:
        chat = Chat(
            id=str(uuid.uuid4()),
            title="New Chat",
            created_at=datetime.utcnow()
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(e)}")

@app.get("/api/chats", response_model=list[ChatResponse])
async def get_chats(db: Session = Depends(get_db)):
    """Get all chats ordered by creation date"""
    chats = db.query(Chat).order_by(desc(Chat.created_at)).all()
    return chats

@app.get("/api/chat/{chat_id}", response_model=list[MessageResponse])
async def get_chat_messages(chat_id: str, db: Session = Depends(get_db)):
    """Get all messages for a specific chat"""
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()
    return messages

async def stream_ollama_response(chat_id: str, message: str, db: Session) -> AsyncGenerator[str, None]:
    """Stream response from Ollama API"""
    try:
        # Save user message
        user_message = Message(
            id=str(uuid.uuid4()),
            chat_id=chat_id,
            role="user",
            content=message,
            timestamp=datetime.utcnow()
        )
        db.add(user_message)
        
        # Update chat title with first message
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            chat.title = message[:50] + "..." if len(message) > 50 else message
        
        db.commit()

        # Stream from Ollama
        assistant_content = ""
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                "http://localhost:11434/api/generate",
                json={
                    "model": "gemma3:1b",
                    "prompt": message,
                    "stream": True
                }
            ) as response:
                if response.status_code != 200:
                    yield f"data: Error: Failed to connect to Ollama\n\n"
                    return
                
                async for chunk in response.aiter_bytes():
                    if chat_id not in active_streams:
                        break
                        
                    try:
                        chunk_str = chunk.decode('utf-8').strip()
                        if chunk_str:
                            lines = chunk_str.split('\n')
                            for line in lines:
                                if line.strip():
                                    data = json.loads(line)
                                    token = data.get('response', '')
                                    if token:
                                        assistant_content += token
                                        yield f"data: {token}\n\n"
                                    
                                    if data.get('done', False):
                                        # Save assistant message
                                        assistant_message = Message(
                                            id=str(uuid.uuid4()),
                                            chat_id=chat_id,
                                            role="assistant",
                                            content=assistant_content,
                                            timestamp=datetime.utcnow()
                                        )
                                        db.add(assistant_message)
                                        db.commit()
                                        return
                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        yield f"data: Error processing response: {str(e)}\n\n"
                        break
                        
    except Exception as e:
        yield f"data: Error: {str(e)}\n\n"
    finally:
        if chat_id in active_streams:
            del active_streams[chat_id]

@app.post("/api/chat/{chat_id}/message")
async def send_message(chat_id: str, message_data: MessageCreate, db: Session = Depends(get_db)):
    """Send a message and stream the response"""
    try:
        # Check if chat exists
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Add to active streams
        active_streams[chat_id] = True
        
        return StreamingResponse(
            stream_ollama_response(chat_id, message_data.message, db),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@app.post("/api/chat/{chat_id}/stop")
async def stop_streaming(chat_id: str):
    """Stop streaming for a specific chat"""
    if chat_id in active_streams:
        del active_streams[chat_id]
        return {"message": "Streaming stopped"}
    return {"message": "No active stream found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)