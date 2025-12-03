# Database Response Time
## RAG
### Embedding Time
- take average of 10 times testing 
### Query Time
- take average of 10 times testing 

[01] emb=0.0796s db=0.0376s matches=3 :: Ensure h1 can reach h2 for troubleshooting runs.

[02] emb=0.0599s db=0.0056s matches=3 :: Permit monitoring probes from h1 to h3.

[03] emb=0.0561s db=0.0055s matches=3 :: Enable h2 to sync data with h4.

[04] emb=0.0595s db=0.0055s matches=3 :: Set up redundant intents so every host can reach every other host.

[05] emb=0.0607s db=0.0055s matches=3 :: Guarantee nightly log uploads from h3 to h2 complete without interruption.

[06] emb=0.0574s db=0.0055s matches=3 :: Favor RTP video between h1 and h2.

[07] emb=0.0622s db=0.0042s matches=3 :: Prioritize VoIP control packets from h2 to h3 on port 6000.

[08] emb=0.0458s db=0.0043s matches=3 :: Deprioritize FTP transfers from h3 to h4.

[09] emb=0.0448s db=0.0042s matches=3 :: Accelerate HTTP sessions from h1 to h3 during office hours.

[10] emb=0.0454s db=0.0042s matches=3 :: Ensure ICMP health checks from h2 to h1 are serviced quickly.

Summary
----------------------------------------
Samples          : 10
Average embed    : 0.0571 s
Average DB query : 0.0082 s


# LLM Response Time
## Calling Groq API
### 1. GPT-OSS-20B

## llama-server (llama.cpp)