from fastapi import FastAPI, Request
from pydantic import BaseModel
# import llama_client 
import groq_client as llama_client

app = FastAPI(title="FYP Agent API")

# Define request body model
class UserRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_response(req: UserRequest):
    """Endpoint that takes user prompt and returns LLM response"""
    try:
        reply = llama_client.send_prompt(req.prompt)
        return {"status": "success", "response": reply}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def root():
    return {"message": "FYP Agent is running 🚀"}
