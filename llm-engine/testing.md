# 1. testing on model efficiency

| Command | Eval | Using |
|-----------|-----------|-----------|
|--n-cpu-moe **36** --n-gpu-layers **999** -c **0** |79678.06 ms /  7950 tokens (99.78 tokens/s)|✅|
|--n-cpu-moe **24** --n-gpu-layers **999** -c **0**|155502.70 ms / 10179 tokens (65.46 tokens/s)||
|--n-cpu-moe **36** --n-gpu-layers **999** -c **0**|155955.29 ms / 10195 tokens (65.37 tokens/s)||

**Conclusion:** 
Context-window doesn't affect after offload all moe layers to CPU.
When you set `--n-cpu-moe N`, you are telling the runtime to offload N MoE blocks (layers with experts) to CPU memory.
- Those layers no longer sit in GPU VRAM — freeing GPU memory.
- But every time the model executes those layers, it has to transfer activations from GPU → CPU → GPU.
- This slows down inference due to PCIe latency and bandwidth limits.

So, increasing n-cpu-moe reduces VRAM usage but increases CPU load and memory transfer overhead.

**Number of MoE layers offloaded to CPU:**
