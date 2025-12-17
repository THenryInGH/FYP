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

## 2. ONOS disconnect with testbed with unknown reason
- solved by reset the testbed
1. stop onos `sudo systemctl stop onos`
2. delete cache:
```bash
sudo rm -rf /opt/onos/apache-karaf-4.2.9/data/db/*
sudo rm -rf /opt/onos/apache-karaf-4.2.9/data/cache/*

```
3. clean topo (may need to run twice)
```bash
cd FYP/onos-testbed/scripts
bash clean-topo.sh
```

4. start onos
`sudo systemctl start onos`

5. setup topo 
```bash
cd FYP/onos-testbed/scripts
bash mesh-topo.sh
```

6. (Optional) ping between hosts if ping test failed the first time

## 3. Project structure update
- combine all service at backend
    - frontend pass to backend to fetch onos info
- run at tmux with following command
```bash
cd /home/henry/FYP
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```