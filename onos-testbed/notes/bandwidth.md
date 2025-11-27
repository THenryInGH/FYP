# Bandwidth of veth
- veth by default don't specify any speed

## Verification
### 1. Iperf 
- actively generates traffic (TCP or UDP) between sender and receiver and reports throughput, jitter, packet loss, etc. Not a packet sniffer.
```bash
iperf3 -s   # in one namespace
iperf3 -c <server_ns_ip>  # in another namespace

```
**Output:**

[ ID] Interval           Transfer     Bitrate         Retr

[  5]   0.00-10.00  sec  24.7 GBytes  21.2 Gbits/sec    0             sender

[  5]   0.00-10.00  sec  24.7 GBytes  21.2 Gbits/sec                  receiver

### 2. tcpdump 
- captures live packets on an interface and prints/records their headers and payload

- Verify that flows actually carry the expected 5-tuple (port/proto), confirm traffic classification by LLM/intent.

- Debugging: confirm packets match OpenFlow matches (e.g., check tp_dst, IPs).

- Capture pcap files for offline analysis (Wireshark) to prove correctness in thesis/demos.

```bash
# capture UDP traffic to dst port 5001 and display summary
tcpdump -i br0 udp and dst port 5001 -nn -tt
# write pcap for later
tcpdump -i br0 -w capture_video.pcap udp and dst port 5001

```

## Bandwidth control
### 1. [tc](https://man7.org/linux/man-pages/man8/tc.8.html)
### 2. OVS QoS + Queues 
```bash
# 1. create queue
sudo ovs-vsctl -- \
set Port s1-eth1 qos=@newqos -- \
--id=@newqos create QoS type=linux-htb \
  other-config:max-rate=100000000 \
  queues:1=@q1 -- \
--id=@q1 create Queue other-config:max-rate=20000000

# 2. verify queue
sudo ovs-vsctl list queue

```
### 3. OpenFlow Meters
```bash
sudo ovs-ofctl add-meter br0 "meter=1 kbps bands=type=drop rate=20000"

```

### Differences between 2. OVS queue and 3. OpenFlow meter
| Aspect                 |                                                                           OVS Queues (QoS) | OpenFlow Meters                                                                              |
| ---------------------- | -----------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------- |
| Where it is configured |                                                OVSDB (ovs-vsctl) → port-level QoS + queues | OpenFlow pipeline → switch-level meters/tables                                               |
| Enforcement mechanism  |                                             Kernel qdisc or switch queue (per-port queues) | Token-bucket-like meter bands (rate/ drop/DSCP) applied by flow action                       |
| Typical command        |                                                         `ovs-vsctl` to create QoS + queues | `ovs-ofctl` (OF13) `add-meter` + flows referencing `meter:id`                                |
| Granularity            |               Port-level queues; flows assigned to queues via queue mapping or flow action | Per-flow rate limiting (flow references meter id)                                            |
| Useful when            |              You want per-port classes and queueing discipline (priorities, min/max rates) | You want to rate-limit specific flows with meter action in flow table                        |
| Pros                   | Robust, well-understood, integrates with kernel qdisc, good for shaping and prioritization | Native OpenFlow mechanism, programmable by controller via flow rules, good per-flow policing |
| Cons                   |                   Need mapping logic to send flows to queue (controller or static mapping) | Not all switch implementations behave identically; meter count/feature limits may apply      |

### Where ONOS fits and dev plan
| Component                                            |          Supports queues/meters *natively*? | Can ONOS use them today? |                      Extra work needed? |
| ---------------------------------------------------- | ------------------------------------------: | -----------------------: | --------------------------------------: |
| **ONOS Device APIs**                                 | ✔ Yes (OpenFlow + OVSDB capabilities exist) |               ✔ Possible |          Must write code to invoke them |
| **ONOS Intent Framework (default HostToHostIntent)** |           ❌ No built-in meter/queue install |          ❌ Not automatic | You must extend / write custom compiler |
| **Custom ONOS Application or Custom Intent Type**    |                                     ✔ Fully |    ✔ Recommended for FYP |  This is where meters/queues get pushed |


> Without touching our testbed we have two ways to do qos control on our network one is using ovs qos and the another is openflow meter. we can set both of them on our ovs switches using onos but onos intent framework doesnt natively support them