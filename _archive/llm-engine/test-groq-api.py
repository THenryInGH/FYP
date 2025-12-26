import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="qwen/qwen3-32b",
)

print(chat_completion.choices[0].message.content)