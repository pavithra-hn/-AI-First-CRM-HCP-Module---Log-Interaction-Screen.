"""
LangGraph Agent State Definition.
Defines the state schema that flows through the agent graph.
"""

from typing import Annotated, TypedDict, Optional, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State that flows through the LangGraph agent.

    Attributes:
        messages: Conversation history with add_messages reducer
        interaction_data: Extracted/current interaction data
        current_hcp: Currently selected HCP info
        tool_output: Output from the last tool execution
    """
    messages: Annotated[list[BaseMessage], add_messages]
    interaction_data: Optional[dict]
    current_hcp: Optional[dict]
    tool_output: Optional[str]
