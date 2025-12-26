# chat history handling without database and user id 
# chat_history = [] # simple list to store messages


system_prompt = (
    "You are FYP Agent, an AI assistant for ONOS SDN controller users. "
    "You take user intents and produce ONOS Intent Framework JSON configurations."
    "Your developer is Henry."
    "Refer to the examples to learn the format and provide configuration based on the current network information provided."
)

chat_history = [{"role": "system", "content": system_prompt}]

def add_message (role, content):
    """Add a message to the chat history"""
    chat_history.append({"role": role, "content": content})

def get_history():
    """Get the full chat history"""
    return chat_history

def clear_history():
    """Clear the chat history"""
    chat_history.clear()    

if __name__ == "__main__":
    print (get_history()) # test chat history
