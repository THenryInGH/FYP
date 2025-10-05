# Learning and Debug Log

## Learning
1. LLM
2. GPU
3. OS
### 1. LLM
#### Prompts
#### Weights
#### KV cache
#### Context windows
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