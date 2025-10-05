#!/bin/bash

set -e

# Script to create a tree topology 
# 1 root OVS, 2 branch OVS, 4 end hosts (namespaces)

# 1. Declare variables
NAMESPACES=("h1" "h2" "h3" "h4") # 4 end hosts
BRANCH_OVS=("s1" "s2") # 2 branch OVS switches
ROOT_OVS="s0" # 1 root OVS switch
NUM_NETNS_PER_OVS=2  # Each OVS connects to 2 namespaces    
NUM_OVS_PER_ROOT=2  # Root OVS connects to 2 branch OVS
IP_BASE="10.0.0."  # Base IP address for namespaces
IP_MASK="/24"  # Subnet mask
IP_INDEX=1  # Starting index for IP addresses


# 2. Create topology (one loop to one layer)
index=0
for root in $ROOT_OVS; do
    # Create root OVS
    sudo ovs-vsctl add-br "$root"
    # Point root OVS to ONOS controller
    sudo ovs-vsctl set-controller "$root" tcp:localhost:6653
    sudo ovs-vsctl set bridge "$root" protocols=OpenFlow13
    # Bring up root OVS
    sudo ip link set "$root" up
    # Connect root OVS to branch OVS
    for ovs in "${BRANCH_OVS[@]}"; do # "${BRANCH_OVS[@]} expand to each element in array"
        # Create branch OVS
        sudo ovs-vsctl add-br "$ovs"
        # Create veth pair between root OVS and branch OVS
        sudo ip link add "veth-$root-$ovs" type veth peer name "veth-$ovs-$root"
        sudo ovs-vsctl add-port "$root" "veth-$ovs-$root"
        sudo ovs-vsctl add-port "$ovs" "veth-$root-$ovs"
        # Bring up interfaces
        sudo ip link set "veth-$root-$ovs" up
        sudo ip link set "veth-$ovs-$root" up
        sudo ip link set "$ovs" up
        # Point branch OVS to ONOS controller
        sudo ovs-vsctl set-controller "$ovs" tcp:localhost:6653
        sudo ovs-vsctl set bridge "$ovs" protocols=OpenFlow13
        # Connect branch OVS to two namespaces each
        for ((i=0; i<$NUM_NETNS_PER_OVS; i++)); do
            ns=${NAMESPACES[$index]}
            # Create namespace
            sudo ip netns add "$ns"
            # Create veth pair between branch OVS and namespace
            sudo ip link add "veth-$ovs-$ns" type veth peer name "veth-$ns-$ovs"
            sudo ip link set "veth-$ovs-$ns" netns "$ns"
            sudo ovs-vsctl add-port "$ovs" "veth-$ns-$ovs"
            # Assign IP address to the namespace
            sudo ip netns exec "$ns" ip addr add "$IP_BASE$IP_INDEX$IP_MASK" dev "veth-$ovs-$ns"
            # Bring up interfaces
            sudo ip netns exec "$ns" ip link set lo up
            sudo ip netns exec "$ns" ip link set "veth-$ovs-$ns" up
            sudo ip link set "veth-$ns-$ovs" up
            # Increment IP index and namespace index
            IP_INDEX=$((IP_INDEX + 1))
            index=$((index + 1))
        done
    done
done

# 3. Verification
# Ping test between namespaces
for ns1 in "${NAMESPACES[@]}"; do
    for ns2 in "${NAMESPACES[@]}"; do
        if [ "$ns1" != "$ns2" ]; then
            echo "Pinging from $ns1 to $ns2"
            sudo ip netns exec "$ns1" ping -c 3 "10.0.0.$(( ${ns2:1} ))"
        fi
    done
done

echo "Tree topology created successfully."
echo "Root OVS: $ROOT_OVS"
echo "Branch OVS: ${BRANCH_OVS[*]}" # Expands all elements as a single word, @ is seperate string
echo "Namespaces: ${NAMESPACES[*]}" 

# Future improvements:
# - Use associated array to map IP to namespace