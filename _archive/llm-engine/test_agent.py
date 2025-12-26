import requests 

# test LLM API
LLM_API_URL = "http://localhost:8080/v1/chat/completions"

def test_llm_api():
    response = requests.post(LLM_API_URL, json={
        "model": "gpt-oss-20b",
        "messages": [{"role": "system", "content": "You are a helpful assistant."}, 
                    {"role": "user", "content": "Who is your developer?"}
                    ],})
    print(response.json()["choices"][0]["message"]["content"])

if __name__ == "__main__":
    test_llm_api()
    