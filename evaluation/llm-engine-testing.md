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

# 2. Verification command use to check is LLM agent api working
```bash
# at another host
curl http://10.100.10.15:5000
# output should be : {"message":"FYP Agent is running 🚀"}

curl -X POST "http://10.100.10.15:5000/generate" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Make sure 10.0.0.1 can communicate 10.0.0.2"}'

# when llm is running on same host
curl -X POST "http://localhost:5000/generate" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Make sure 10.0.0.1 can communicate 10.0.0.2"}'

```