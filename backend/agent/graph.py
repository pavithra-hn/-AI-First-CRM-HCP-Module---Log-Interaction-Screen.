"""
LangGraph Agent Graph Definition.
Defines the AI agent workflow for managing HCP interactions.
"""

import os
import json
from typing import Dict, Any

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from dotenv import load_dotenv

from agent.state import AgentState
from agent.tools import ALL_TOOLS
from agent.prompts import SYSTEM_PROMPT

load_dotenv()


def get_llm():
    """Get the Groq LLM instance with tools bound."""
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        # NOTE: The assignment specified `gemma2-9b-it`, but Groq has since
        # decommissioned that model (returns HTTP 400). We use the doc-permitted
        # alternative `llama-3.3-70b-versatile`, which also supports tool-calling.
        model_name=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
        temperature=0.3,
    )
    return llm.bind_tools(ALL_TOOLS)


def agent_node(state: AgentState) -> Dict[str, Any]:
    """Main agent node - processes messages and decides on tool usage."""
    llm = get_llm()

    messages = state["messages"]

    # Ensure system prompt is the first message
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(messages)

    response = llm.invoke(messages)

    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """Determine whether to continue with tools or end the conversation."""
    messages = state["messages"]
    last_message = messages[-1]

    # If the LLM made tool calls, route to the tool node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    # Otherwise, end the conversation turn
    return END


def build_graph():
    """Build and compile the LangGraph agent."""
    # Create the graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(ALL_TOOLS))

    # Set entry point
    graph.set_entry_point("agent")

    # Add conditional edges
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )

    # After tool execution, go back to agent for response
    graph.add_edge("tools", "agent")

    # Compile the graph
    return graph.compile()


# Create the compiled graph instance
agent_graph = build_graph()


async def run_agent(message: str, conversation_history: list = None) -> dict:
    """Run the agent with a user message.

    Args:
        message: The user's input message
        conversation_history: Optional list of previous messages

    Returns:
        dict with response text and metadata
    """
    messages = []

    # Add conversation history if provided
    if conversation_history:
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

    # Add current message
    messages.append(HumanMessage(content=message))

    # Prepare initial state
    initial_state = {
        "messages": messages,
        "interaction_data": None,
        "current_hcp": None,
        "tool_output": None,
    }

    # Run the graph
    result = agent_graph.invoke(initial_state)

    # Extract the final response
    final_messages = result["messages"]
    last_ai_message = None
    tool_used = None

    for msg in reversed(final_messages):
        if isinstance(msg, AIMessage) and msg.content:
            last_ai_message = msg
            break

    # Check if any tools were used
    for msg in final_messages:
        if isinstance(msg, AIMessage) and hasattr(msg, "tool_calls") and msg.tool_calls:
            tool_used = msg.tool_calls[0]["name"] if msg.tool_calls else None

    response_text = last_ai_message.content if last_ai_message else "I couldn't process your request. Please try again."

    # Try to extract interaction data from tool messages
    interaction_data = None
    for msg in final_messages:
        if hasattr(msg, "content") and isinstance(msg.content, str):
            try:
                parsed = json.loads(msg.content)
                if isinstance(parsed, dict) and parsed.get("status") == "success":
                    interaction_data = parsed
            except (json.JSONDecodeError, TypeError):
                pass

    return {
        "response": response_text,
        "tool_used": tool_used,
        "interaction_data": interaction_data,
    }
