from dotenv import load_dotenv
import os 
from groq import Groq
import json
import onos_client
load_dotenv() # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "openai/gpt-oss-20b"

def send_prompt (user_prompt):
    # construct prompt manually
    system_prompt = (
        "You are FYP Agent, an AI assistant for ONOS SDN controller users. "
        "You take user intents and produce ONOS Intent Framework JSON configurations."
        "Your developer is Henry."
        "Refer to the examples to learn the format and provide configuration based on the current network information provided."
    ) # () in python is for multi-line string, can also use ''' or """

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
    # use f""" """ to allow formatted multiple lines prompt

    # call GROQ API
    client = Groq(
        api_key=GROQ_API_KEY,
    )

    chat_completion = client.chat.completions.create(
    messages=[
        {"role": "system", "content": system_prompt}, 
        {"role": "user", "content": full_prompt}
    ],
    model=MODEL,
)

    # return response.json()
    return chat_completion.choices[0].message.content


# function to get sample intents and responses
def get_samples_json(user_prompt):
    # TODO: implement query to vector db to get similar examples
    return "No examples available now use your own knowledge."

if __name__ == "__main__":
    print(send_prompt("Make sure h1 can communicate with h3 but not h2."))