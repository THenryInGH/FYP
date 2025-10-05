#!/bin/bash

# Bash exit on error
set -e

# Namespace array
NAMESPACES=("h1" "h2")
# 1. Create namespaces (end hosts)
for ns in "${NAMESPACES[@]}"; do
    sudo ip netns add "$ns"
done

# 2. Create veth pairs 
for ns in "${NAMESPACES[@]}"; do
    sudo ip link add "veth-br-$ns" type veth peer name "veth-$ns-br"
done

# 3. Assign veth to netns
for ns in "${NAMESPACES[@]}"; do
    sudo ip link set "veth-br-$ns" netns "$ns"
done

# 4. Assign IPs inside namespace (for L3 purpose)
i=1
for ns in "${NAMESPACES[@]}"; do
    sudo ip netns exec "$ns" ip addr add "10.0.0.$i/24" dev "veth-br-$ns"
    ((i++))
done

# 5. Create OVS bridge & attach ports
sudo ovs-vsctl add-br s1
for ns in "${NAMESPACES[@]}"; do
    sudo ovs-vsctl add-port s1 "veth-$ns-br"
done

# 6. Bring up all interfaces
for ns in "${NAMESPACES[@]}"; do
    sudo ip netns exec "$ns" ip link set lo up
    sudo ip netns exec "$ns" ip link set "veth-br-$ns" up
    sudo ip link set "veth-$ns-br" up
done
sudo ip link set s1 up

# 7. Point OVS to ONOS controller
sudo ovs-vsctl set-controller s1 tcp:127.0.0.1:6653

# 8. Force OVS using OpenFlow13
sudo ovs-vsctl set bridge s1 protocols=OpenFlow13



