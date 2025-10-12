# functions for LLM API
import requests
import json
messages = [
  {"role": "system", "content": "You are a helpful assistant."},
  {"role": "user", "content": "Hi"},
  {"role": "assistant", "content": "Hello! How can I help?"},
  {"role": "user", "content": "Tell me a joke"}
]

resp = requests.post("http://localhost:8080/v1/chat/completions", json={
    "model": "gpt-oss-20b",
    "messages": messages
})
data = resp.json()
print(json.dumps(data, indent=2)) # pretty print json with dumps
# print(resp.json())
# print(resp.json()["choices"][0]["message"]["content"])
# LLM response, resp is just a HTTP status code like 200 if success
# need to convert to json and select the content field