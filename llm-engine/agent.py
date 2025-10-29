from fastapi import FastAPI, Request
from pydantic import BaseModel
# import llama_client 
import groq_client as llama_client
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FYP Agent API")

# Allow your frontend device IP/domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or replace * with your frontend IP if you want stricter
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
