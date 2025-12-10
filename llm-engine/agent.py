import time

from fastapi import FastAPI
from pydantic import BaseModel

import groq_client as llama_client
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FYP Agent API")

# Allow your frontend device IP/domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define request body model
class UserRequest(BaseModel):
    prompt: str
    model: str | None = None
    use_rag: bool = True

@app.post("/generate")
def generate_response(req: UserRequest):
    """Endpoint that takes user prompt and returns LLM response"""
    try:
        start = time.perf_counter()
        result = llama_client.send_prompt(
            req.prompt,
            model=req.model,
            use_rag=req.use_rag,
        )

        if isinstance(result, dict):
            timings = result.get("timings") or {}
            timings.setdefault("total_seconds", time.perf_counter() - start)
            return {
                "status": "success",
                "response": result.get("content"),
                "model": result.get("model") or req.model,
                "use_rag": result.get("use_rag", req.use_rag),
                "timings": timings,
            }

        # Backward compatibility if send_prompt returns plain text
        return {
            "status": "success",
            "response": result,
            "model": req.model,
            "use_rag": req.use_rag,
            "timings": {"total_seconds": time.perf_counter() - start},
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def root():
    return {"message": "FYP Agent is running 🚀"}
