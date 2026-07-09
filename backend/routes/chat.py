"""
Chat API Route — Connects to the LangGraph AI Agent.
"""

import uuid
from fastapi import APIRouter, HTTPException
from schemas import ChatMessage, ChatResponse
from agent.graph import run_agent

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# In-memory conversation store (for demo purposes)
conversations: dict = {}


@router.post("", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Send a message to the AI agent and get a response.
    Supports conversational context via conversation_id.
    """
    try:
        # Get or create conversation
        conversation_id = message.conversation_id or str(uuid.uuid4())

        if conversation_id not in conversations:
            conversations[conversation_id] = []

        # Add user message to history
        conversations[conversation_id].append({
            "role": "user",
            "content": message.message
        })

        # Run the AI agent
        result = await run_agent(
            message=message.message,
            conversation_history=conversations[conversation_id][:-1]  # Exclude current message (already added by agent)
        )

        # Add assistant response to history
        conversations[conversation_id].append({
            "role": "assistant",
            "content": result["response"]
        })

        # Keep only last 20 messages to manage memory
        if len(conversations[conversation_id]) > 20:
            conversations[conversation_id] = conversations[conversation_id][-20:]

        return ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            tool_used=result.get("tool_used"),
            interaction_data=result.get("interaction_data"),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.delete("/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear a conversation's history."""
    if conversation_id in conversations:
        del conversations[conversation_id]
    return {"message": "Conversation cleared"}
