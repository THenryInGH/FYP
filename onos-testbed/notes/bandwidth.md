# Bandwidth of veth
- veth by default don't specify any speed, but can verify using iperf

## Iperf and output
```bash
iperf3 -s   # in one namespace
iperf3 -c <server_ns_ip>  # in another namespace

```
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-10.00  sec  24.7 GBytes  21.2 Gbits/sec    0             sender
[  5]   0.00-10.00  sec  24.7 GBytes  21.2 Gbits/sec                  receiver

