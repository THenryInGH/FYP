from __future__ import annotations

# NOTE: this is intentionally still in-memory.
# Next step (login + DB) is to persist per-user/per-conversation history.

system_prompt = (
    "You are FYP Agent, an AI assistant for ONOS SDN controller users. "
    "You take user intents and produce ONOS Intent Framework JSON configurations."
    "Your developer is Henry."
    "Refer to the examples to learn the format and provide configuration based on the current network information provided."
)

chat_history = [{"role": "system", "content": system_prompt}]


def add_message(role: str, content: str) -> None:
    """Add a message to the chat history."""
    chat_history.append({"role": role, "content": content})


def get_history():
    """Get the full chat history."""
    return chat_history


def clear_history() -> None:
    """Clear the chat history."""
    chat_history.clear()


__all__ = ["add_message", "get_history", "clear_history", "system_prompt"]

