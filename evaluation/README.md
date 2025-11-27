# FYP evaluation
- aims to automate network administration tasks
- evaluate based on objectives mentioned in [README](../README.md)
- same evaluation criteria applied to different LLM models and different configurations.
- showcase the performance improvement (devices db, few-shot prompting, RAG, fine-tunning(tentative))

## Obj 1: Configuration accuracy
- percentage of valid JSON
- accuracy of converting users' intents to configuration
### Verification
1. Host-to-Host connectivity
    - ping between devices

2. Bandwidth/QoS constraint on flows
    - use iperf to show bandwidth based on five tuples
    - traffic type will be used:

        |           Traffic | Protocol |         Port (dst) | Example 5-tuple (src→dst)           |
        | ----------------: | -------- | -----------------: | ----------------------------------- |
        | Video / Streaming | UDP      |           **5001** | 10.0.1.1:5001 → 10.0.2.1:5001 (UDP) |
        |     File transfer | TCP      |           **8000** | 10.0.1.2:8000 → 10.0.3.1:8000 (TCP) |
        |              VoIP | UDP      |           **6000** | 10.0.1.3:6000 → 10.0.2.3:6000 (UDP) |
        |        HTTP (web) | TCP      | **80** or **8080** | 10.0.1.4:8080 → 10.0.2.4:8080 (TCP) |
        |       ICMP (ping) | ICMP     |                  — | use ping between IPs                |


3. Multi-ingress/ multi-egress flows (load balancing)
    - ONOS sflow
    - iperf

4. Blocking/ security flows (simple ACLs)
    - ping between devices

## Obj 2: Complexity abstraction
- chatbox working properly
- devices database provide LLM context of device name (compare accuracy of using it and without it)

## Obj 3: IMR
- iperf also

## Obj 4: Respontive dashboard
- Dashboard showing the topology, network statistic and intent configuration
- Dashboard refresh every 5 seconds
- Users can give feedback on the response whether it is possitive or negative.
- Response with possive feedback from users will be submitted to config_sample database.
- Users can revert back the configuration done.
