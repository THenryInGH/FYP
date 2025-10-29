from dotenv import load_dotenv
import os 
from groq import Groq
import json
import onos_client
from chat_history import add_message, get_history
load_dotenv() # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "openai/gpt-oss-20b"

def send_prompt (user_prompt):
    
    # system_prompt = (
    #     "You are FYP Agent, an AI assistant for ONOS SDN controller users. "
    #     "You take user intents and produce ONOS Intent Framework JSON configurations."
    #     "Your developer is Henry."
    #     "Refer to the examples to learn the format and provide configuration based on the current network information provided."
    # ) # () in python is for multi-line string, can also use ''' or """

    # get sample json 
    samples_json = get_samples_json(user_prompt)

    # combine examples and user input
    full_prompt = f""" 
      Here are the current network state:
      {json.dumps(onos_client.get_network_info(), indent=2)}
      Here are some example intents to configuration pairs:
      {json.dumps(samples_json, indent=2)}
      Now process this user request:
      {user_prompt}   
    """
    
    # add user message to chat history
    add_message("user", full_prompt)

    # call GROQ API
    client = Groq(
        api_key=GROQ_API_KEY,
    )

    chat_completion = client.chat.completions.create(
    messages=get_history(),
    model=MODEL,
)

    # add assistant message to chat history
    add_message("assistant", chat_completion.choices[0].message.content)

    # return response content
    return chat_completion.choices[0].message.content


# function to get sample intents and responses
def get_samples_json(user_prompt):
    # TODO: implement query to vector db to get similar examples
    return "No examples available now use your own knowledge."

if __name__ == "__main__":
    print(send_prompt("Make sure h1 can communicate with h3 but not h2."))