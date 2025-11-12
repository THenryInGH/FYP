# Logs happened across whole project
## 1. Shift from GPU machine to single machine only as GPU instability
- llm-engine 
    - using Groq API currently no need to set up llama.cpp here first
    - first install uv and packages required
    ```bash
    uv sync
    ```
    - set up env file for GROQ API key at the dir, llm-engine
    - 
- frontend
    - change .env from private IP to localhost
- database