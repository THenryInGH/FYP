# Network namespaces (netns)
- kernel-level isolation of an independent network stack (interfaces, routing tables, iptables, etc)
## Commands
```bash
# list namespaces
ip netns list

# create / delete namespace
sudo ip netns add ns1
sudo ip netns del ns1

# run a shell inside namespace
sudo ip netns exec ns1 bash

# test connectivity
sudo ip netns exec ns1 ping -c 3 192.168.10.1
```
# Virtual Ethernet (veth)
- kernel virtual Ethernet devices created in pairs; packet transmitted on one end appear on the peer immediately
- standard way to connect two namespaces or a namespace to the host/bridge/OVS
- `ip link add nameA type veth peer name nameB`
- pair show link down when one end down
- [man page](https://man7.org/linux/man-pages/man4/veth.4.html)

## Commands
1. create veth
```bash
# create a veth pair (simplest way)
sudo ip link add <nameA> type veth peer name <nameB>

# with namespace assignment
ip link add <p1-name> netns <p1-ns> type veth peer <p2-name> netns <p2-ns>

# With queueing discipline or MTU
ip link add veth0 type veth peer name veth1 mtu 1400

```
- `ip link add` → create a new network device.
- `<nameA>` → name of the first veth interface (host-visible right after creation).
- `type veth` → tells the kernel to make a virtual Ethernet device pair 

    👉 Variations:
    - `veth` = local cable.
    - `dummy` = fake NIC.
    - `bridge` = software switch.
    - `vxlan` = L2 over UDP/IP tunnel for overlays.
    - `gre` = generic IP tunneling protocol.
- `peer name <nameB>` → defines the other end of the pair.

2. MTU
- Maximum Transmission Unit
- maximum size of a packet in bytes that can be transmitted on an interface without fragmentation
- default: 1500 bytes
```bash
ip link show veth0   # see mtu 1500
ip link set veth0 mtu 1400

```
3.  move one end into a namespace
```bash
sudo ip link set veth-ns netns ns1
```
4. bring up interfaces
```bash
sudo ip link set veth-host up
sudo ip netns exec ns1 ip link set veth-ns up
sudo ip netns exec ns1 ip link set lo up
```
5. assign IP
```bash
sudo ip addr add 192.168.10.1/24 dev veth-host
sudo ip netns exec ns1 ip addr add 192.168.10.2/24 dev veth-ns
```

# Example use cas
1. Two namespaces connected by an OVS bridge
```bash
# 1) create OVS bridge
sudo ovs-vsctl add-br br0
sudo ip link set br0 up

# 2) create namespaces
sudo ip netns add ns1
sudo ip netns add ns2

# 3) create veth pairs (host <-> ns)
sudo ip link add veth-host1 type veth peer name veth-ns1
sudo ip link add veth-host2 type veth peer name veth-ns2

# 4) move the ns ends into namespaces
sudo ip link set veth-ns1 netns ns1
sudo ip link set veth-ns2 netns ns2

# 5) add host ends to OVS
sudo ovs-vsctl add-port br0 veth-host1
sudo ovs-vsctl add-port br0 veth-host2

# 6) bring up host ends and OVS bridge
sudo ip link set veth-host1 up
sudo ip link set veth-host2 up

# 7) inside namespaces: bring up interface, set lo, assign IP
sudo ip netns exec ns1 ip link set veth-ns1 up
sudo ip netns exec ns1 ip link set lo up
sudo ip netns exec ns1 ip addr add 10.0.0.1/24 dev veth-ns1

sudo ip netns exec ns2 ip link set veth-ns2 up
sudo ip netns exec ns2 ip link set lo up
sudo ip netns exec ns2 ip addr add 10.0.0.2/24 dev veth-ns2

# 8) test
sudo ip netns exec ns1 ping -c 3 10.0.0.2
```

2. Connecting OVS to an SDN controller
```bash
sudo ovs-vsctl set-controller br0 tcp:CONTROLLER_IP:6653

```