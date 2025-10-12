# Learning and Debug Log

## Learning
1. LLM
2. GPU
3. OS
### 1. LLM
- Neural network model trained by large amount of text data to understand, generate and response to human-like test
- predict next token (word, character, or subword) based on previous token

#### Prompts
- instructions or inputs sent to LLM for generating response.
- model processes the prompt within its **context window** to determine the most likely tokens

#### Weights
- parameters that used to compute the possible next tokens

#### KV cache
- mechanism to store key and value representations from previous tokens during inference
- allows model to reuse past computation instead of recalculating attention for all previous tokens

#### Context windows
- the maximum number of tokens (prompts + responces) model can see once
- out of this scope, model cannot remember unless special techniques (like sliding windows or RAG)

#### Self-Attention
- core mechanism in transformers that lets the model **focus on relevant parts of the input sequenc**e when generating or understanding text
- Variants: [Flash Attention](#flash-attention), Paged Attention
#### Inference
- process of generating model output given input (prompts)
- In LLM context: you feed in tokenized prompt(s), then generate continuation tokens (or entire completions).
- In llama.cpp / llama-server, inference involves (a) computing attention / feedforward layers, (b) maintaining KV cache (keys & values from previous tokens) for context, and (c) decoding / sampling strategies.
#### Batching
- group simultaneous multiple prompts from multiple users to send to LLM together to save memory from repeating iterations through whole model.
#### Mixture of Expert 
- new style of LLM, use only parts of the model to save memory
A normal dense model:
```less
input → layer → layer → layer → output
```
A Mixture-of-Experts (MoE) model:
```less
input → layer → [router selects 2 experts out of 16] → combine results → next layer
```
Each expert is like a small feed-forward network (FNN) (a set of weights).
For every token:
- A router network computes scores for each expert.
- It picks the top-k (usually 2).
- Only those experts run forward computations.
- Their outputs are merged (weighted sum).

This means:
- Even though total model parameters ≈ 120 B, only a few B are active per token.
- Hence, it’s possible to run such a model on smaller hardware if you stream or offload inactive experts.

🧮 What --n-cpu-moe 36 does
- MoE experts are large but sparse.
- llama.cpp can schedule those expert FFNs to run on CPU threads.
- GPU still does attention + routing, CPU handles MoE experts.
- That’s what “offload MoE computation” means — the expert forward passes run on CPU.

### 2. GPU
- type of processor that contains many simple cores that designed to run tasks in parallel.
- more efficient for neural model training and running compared to CPU

#### NVIDIA RTX series
- consumer-grade GPUs developed by NVIDIA
- optimized for graphics rendering or general-purpose parallel computing via CUDA.

#### NVIDIA driver
- driver developed by NVIDIA for OS to manage and utilize NVIDIA GPUs properly.
- `NVIDIA kernel driver`: part of driver that runs inside the Linux kernel (the core of the os)

#### CUDA
- Compute Unified Device Architecture
- parallel computing platform and programming model created by NVIDIA
- Toolkit provides libraries, compilers and tools that allows developer to access and control the GPU cores directly for general-purpose computing, not just graphic rendering
##### nvcc
- part of toolkits
- NVIDIA CUDA compiler driver
- `nvcc --version` one of the major commands to check installation of CUDA

#### NVIDIA System Management Interface (nvidia-smi)
- CLI tool that queries GPU status using NVML library
- `nvidia-smi`
- Shows: GPU utilization, memory usage, temperature, running processes, driver version.
- Great for debugging whether your driver + GPU are active.
- task manager of GPU

### 3. OS
#### Kernel
- central of OS that manages resources including
    - Processes → scheduling CPU time.
    - Memory → deciding who gets which part of RAM.
    - Hardware → through drivers (GPU, disk, network card).
    - System calls → interface for user programs to ask the kernel to do things.

#### RAM
- fast, volatile memory. At any time, it holds:
- Kernel space memory
    - Kernel code (the “core” of the OS).
    - Kernel modules (e.g., NVIDIA driver `nvidia.ko`).
    - Data structures for process scheduling, memory management, I/O buffers.
- User space memory
    - Application code (your Python script, transformers, etc.).
    - Application data (variables, tensors, model weights loaded into RAM).
    - Shared libraries (.so files like `libc.so`, `libnvidia-ml.so`).
- Cache/buffers
    - Disk cache, network buffers — Linux aggressively caches things in RAM to make the system faster.
- So RAM is like a big hotel. The kernel has its reserved floors, and applications (user space) get the rest of the rooms.

#### Driver
- software used to let OS communicate with hardwares like RTX GPU.

##### Kernel module
- a piece of code that can be loaded into the Linux kernel at runtime, without rebooting the os
- **drivers** are often delivered as kernel modules (*.ko files)
- For NVIDIA, the GPU drivers is a kernel module that gets loaded into memory when boot.
So, NVIDIA kernel driver = kernel module loaded into kernel 

#### Space
Kernel space
- Runs with full privileges (ring 0).
- Can directly interact with hardware.
- Contains kernel + modules + core system tasks.
##### User space
- location where applications run (e.g., python, transformers, nvidia-smi).
- `user-space libraries`: parts of driver installed in `/usr/lib/`, `/usr/local/cuda/lib64/`, etc.

**There aren’t many “spaces” beyond these two — this separation is the big design of modern OS.**

#### Core and threads
| Level                   | Entity                         | Role                                           |
| ----------------------- | ------------------------------ | ---------------------------------------------- |
| Hardware                | Core                           | Physical computing unit                        |
| Hardware                | Hardware thread (logical core) | Independent execution stream per core          |
| OS                      | Software thread                | Unit of work scheduled on a logical core       |
| Application (llama.cpp) | Inference thread               | Performs part of model computation in parallel |

### 4. Llama.cpp
#### llama-server
- part of llama.cpp that exposes model via an OpenAI-compatible REST API
##### Parameters
1. `--model`: path to LLM `.gguf` file
2. `--n-gpu-layers`: number of transformers layer offloaded to GPU (999 to offload as many as possible)
3. `--ctx-size`/`-c`: context length. (0: max value)
4. `--port`: API server port
5. `--host`: binding IP
6. `--threads`: number of CPU threads for inference
7. `--parallel`: number of requests process simultaneously
8. `--batch-size`/`-b`: number of tokens processed per batch 
9. `-hf <model-id>`: specify Hugging Face model ID
10. `--n-cpu-moe`: number of MoE layers to offload to CPU
11. `-fa`: Enable FastAttention (if backend supports it): a faster attention kernel
12. `--jinja`: enable jinjia chat template logic embedded in the model (for instruction + tool/chat formatting)
13. `--reasoning-format <mode>`: control reasoning output formatting (e.g none, default)
##### Flag
1. `--verbose-prompt`: shows full prompt content (great for dubbing Harmony format)
2. `--api-key <key>`: API key if require
3. `--log-format json`: structured logs for monitoring
4. `--mlock`: locks model in RAM to faster startup
5. `--timeout 600`: timeout in seconds for request
6. `--no-cache`: disable response caching
##### Flash attention
- **optimized implementation** of the self-attention mechanism
- performs same math but is much faster and uses less memory by changing how intermediate values are stored
- instead of storing the whole attention matrix like traditional attention, it computes the results in small blocks directly in GPU memory
- does not affect the performance

##### jinjia 
- template engine (a software tool that inserts dynamic data into a text pattern)
- tell llama.cpp automatically format the prompt
### OpenAI-compatible API
**Calling:** 
| **Endpoint**           | **Description**                                 | **Compatibility**              |
| ---------------------- | ----------------------------------------------- | ------------------------------ |
| `/v1/chat/completions` | Chat-style API (like GPT-3.5/4)                 | ✅ identical to OpenAI Chat API |
| `/v1/completions`      | Raw completion endpoint (like text-davinci-003) | ✅                              |
| `/v1/models`           | Lists all available models on the server        | ✅                              |
| `/health`              | Simple health check                             | 🩺 Custom                      |
| `/v1/embeddings`       | If supported by model build                     | ⚙️ Optional                    |

**Output Handling:**
- refer [here](/llm-engine/llama-client.py)
## Debug
1. `16/9/25`
Output this when typing `nvidia-smi`:
    ```bash
    Failed to initialize NVML: Driver/library version mismatch
    NVML library version: 570.172
    ```
    **Reason**:
    - `apt upgrade` will update driver installed using `apt`
    - `nvidia-smi` talks to the NVIDIA kernel driver and the user-space libraries (like NVML).
    - kernel module version (570.169) and the NVML library version (570.172) didn’t match. (`cat /proc/driver/nvidia/version`)

    **Solution**:
    - Reboot: `sudo reboot`
    - When reboot:
        - old kernel module (NVIDIA kernel driver loaded in memory) is unloaded.
        - updated driver files *.ko is loaded into memory
        - both NVML and kernel module match

2. `16/9/25` llama.cpp setup:
    - refer setup guide at [README](/llm-engine/README.md/)

3. `5/10/25` load the model: gpt-oss-20b
    - refer command at [README](/llm-engine/README.md/)

4. `12/10/25` setup structure and learn llama-server

5. `12/10/25` exploring jinjia and harmony
    - Harmony rendering library like `openai_harmony` cannot be used in llama.cpp
    - when gpt-oss is hosted at llama.cpp, it is expecting plain text input 
    - need to use jinjia or plain prompts in python 

    About context windows for self hosted LLM:
    - everytime users input, we are sending the whole context windows to model, need to manage history ourselves.

    Comparison of using pure python & with jinja
    - Pure pyton
        - full control by writing plain text prompt formatting manually using delimiters like `<|user|>`
        - but hard to reuse as each model will have specific conservation and response format
    - With jinja
        - good reusability 
        - but more complex to setup