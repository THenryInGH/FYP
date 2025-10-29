import subprocess 
# the library used to run shell commands in background
import time

def run_tmux_command(session_name, command):
    """ Run a command in a tmux session, creating if not exists"""
    # Check if the tmux session already exists
    check_session = subprocess.run(
        ["tmux", "has-session", "-t", session_name],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    # Create session if not exists
    if check_session.returncode != 0:
        print(f"Creating tmux session: {session_name}")
        subprocess.run(["tmux", "new-session", "-d", "-s", session_name])
    
    # Send command to tmux
    subprocess.run(["tmux", "send-keys", "-t", session_name, command, "C-m"])
    print (f"Command sent to session {session_name}: {command}")

def main():
    # Step 1: Start LLaMA server
    llama_server_cmd = (
        "llama-server -m ./llm-engine/models/gpt-oss/gpt-oss-20b-mxfp4.gguf "
        "--n-cpu-moe 36 --n-gpu-layers 999 -c 0 --port 8080"
    )
    run_tmux_command("llama-server", llama_server_cmd)

    # Optional: wait for server startup
    time.sleep(5)

    # Step 2: Start LLM API
    llm_api_cmd = "cd llm-engine && uvicorn agent:app --host 0.0.0.0 --port 5000"
    run_tmux_command("llm-api", llm_api_cmd)

    print("\n✅ Both LLaMA server and LLM API are running in tmux sessions.")

if __name__ == "__main__":
    main()