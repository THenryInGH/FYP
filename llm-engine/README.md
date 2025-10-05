# LLM Engine
## System
- GPU model: RTX 3080 Ti (12 GB VRAM)
- RAM: 64 GB 
- Operating System: 24.04.2 LTS
- Container: Docker (pending)

## Environment
- NVIDIA driver version: `570.172.09`
    - [Official Installation Guide](https://docs.nvidia.com/datacenter/tesla/driver-installation-guide/index.html#ubuntu-installation)
- CUDA: `12.8`
    - [Official Installation Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html)

## Framework

### llama.cpp from ggml-org
[GitHub](https://github.com/ggml-org/llama.cpp/tree/master)

[Setup guide](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md)

1. Install prerequisites 
    ```bash
    sudo apt update
    sudo apt install -y build-essential cmake git
    # verify CUDA installation
    nvcc --version
    ```
2. Clone llama.cpp
    ```bash
    cd ~/FYP/llm-engine
    git clone https://github.com/ggml-org/llama.cpp
    cd llama.cpp
    ```
3. Build with CUDA support
    ```bash
    cmake -B build -DGGML_CUDA=ON
    cmake --build build --config Release
    ```
4. Verify installation
    ```bash
    cd build
    ./bin/llama-cli --version
    # should see llama.cpp build with CUDA support
    ```
5. Configure path
    ```bash
    nano ~/.bashrc
    # put at bottom line of .bashrc
    export PATH=$HOME/Documents/Henry/FYP/llm-engine/llama.cpp/build/bin:$PATH
    # exit nano and run .bashrc
    source ~/.bashrc
    # verify 
    llama-cli --version
    llama-server --version
    ```
6. Test with a lightweight model
    ```bash
    cd FYP/llm-engine
    llama-cli -m ./models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --n-gpu-layers 20 -p "Hello"
    # another terminal (check real time GPU usage)
    nvidia-smi -l 1
    ```

    **llama-cli example command:**
    ```bash
    llama-cli \
    -m ./models/deepseek-coder-6.7b-instruct.Q4_K_M.gguf \
    --n-gpu-layers 40 \
    -p "Write a Python function that reverses a string."
    ```
    **llama-server example command:**
    ```bash
    llama-server \
    -m ./models/deepseek-coder-6.7b-instruct.Q4_K_M.gguf \
    --n-gpu-layers 40 \
    --port 8080
    ```

### Transformers from Hugging Face
[Docs](https://huggingface.co/docs/transformers/en/index)
[Setup guide](https://huggingface.co/docs/transformers/en/installation?virtual=uv&install=uv)

## Models
- Refer to [models README](models/README.md)
- To install model using `wget` from Hugging Face:
    1. Select desired model
    2. Navigate to files and versions
    3. Select desired variant or version
    4. Right click download icon and copy the `link`
    5. Delete `?download=True` at the end of `link`
    6. wget `link` 

- Running GPT-OSS-20B
```bash
llama-server \
  --model ~/Documents/Henry/FYP/llm-engine/models/gpt-oss/gpt-oss-20b-mxfp4.gguf \
  --n-gpu-layers 40 \
  --ctx-size 4096 \
  --threads 8 \
  --port 8080

```

