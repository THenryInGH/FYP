# functions for LLM API
import requests
import json
import onos_client
LLM_API_URL = "http://localhost:8080/v1/chat/completions"

def send_prompt(user_prompt, *, model=None, use_rag=True):
    # construct prompt manually
    system_prompt = (
        "You are FYP Agent, an AI assistant for ONOS SDN controller users. "
        "You take user intents and produce SDN JSON configurations."
        "Your developer is Henry."
        "Refer to the examples to learn the format and provide configuration based on the current network information provided."
    ) # () in python is for multi-line string, can also use ''' or """

    # get sample json 
    samples_json = get_samples_json(user_prompt)

    # combine examples and user input
    full_prompt = f""" 
      <|user|>
      Here are the current network state:
      {json.dumps(onos_client.get_network_info(), indent=2)}
      Here are some example intents to configuration pairs:
      {json.dumps(samples_json, indent=2)}
      Now process this user request:
      {user_prompt}   
    """
    # use f""" """ to allow formatted multiple lines prompt

    # call LLM API
    chosen_model = model or "gpt-oss-20b"

    response = requests.post(LLM_API_URL, json={
        "model": chosen_model,
        "messages": [{"role": "system", "content": system_prompt}, 
                     {"role": "user", "content": full_prompt}
                    ],})
   
    # return response.json()
    return response.json()["choices"][0]["message"]["content"]


# function to get sample intents
def get_samples_json(user_prompt):
    # TODO: implement query to vector db to get similar examples
    # for now return hardcoded examples
    # return [
    #     {"intent": "Allocate 1Gbps bandwidth between HostA and HostB", "json": {"path": "HostA-HostB", "bandwidth": "1Gbps"}},
    #     {"intent": "Block traffic from HostC to HostD", "json": {"intent": "deny", "source": "HostC", "destination": "HostD"}}
    # ]
    return "No examples available now use your own knowledge."


# test
if __name__ == "__main__":
    print(send_prompt("What can you done to do onos intent configure to current network?"))
    

# data = resp.json()
# print(json.dumps(data, indent=2)) # pretty print json with dumps
# print(resp.json())
# print(resp.json()["choices"][0]["message"]["content"])
# LLM response, resp is just a HTTP status code like 200 if success
# need to convert to json and select the content field