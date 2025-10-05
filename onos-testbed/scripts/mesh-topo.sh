#!/bin/bash

set -u

# set up a full mesh topology with 4 switches and 4 hosts

# 1. Declare variables
NAMESPACES=("h1" "h2" "h3" "h4") # 4 end hosts
OVS_SWITCHES=("s1" "s2" "s3" "s4") # 4 OVS switches
IP_BASE="10.0.0."  # Base IP address for namespaces
IP_MASK="/24"  # Subnet mask
IP_INDEX=1  # Starting index for IP addresses


# 2. Set up topology

# Create OVS switches and assign one host to each switch
index=0
for ovs in "${OVS_SWITCHES[@]}"; do
    # create OVS switch and namespace
    sudo ovs-vsctl add-br "$ovs"
    ns="${NAMESPACES[$index]}"
    sudo ip netns add "$ns"
    # add veth pair between OVS and namespace
    sudo ip link add "veth-$ovs-$ns" type veth peer name "veth-$ns-$ovs"
    sudo ip link set "veth-$ovs-$ns" netns "$ns"
    sudo ovs-vsctl add-port "$ovs" "veth-$ns-$ovs"
    # assign IP address to the host namespace
    sudo ip netns exec "$ns" ip addr add "${IP_BASE}${IP_INDEX}${IP_MASK}" dev "veth-$ovs-$ns"
    # bring up interfaces 
    sudo ip netns exec "$ns" ip link set "veth-$ovs-$ns" up
    sudo ip netns exec "$ns" ip link set lo up
    sudo ip link set "veth-$ns-$ovs" up
    sudo ip link set "$ovs" up
    # point ovs switch to controller
    sudo ovs-vsctl set-controller "$ovs" tcp:localhost:6653
    sudo ovs-vsctl set bridge "$ovs" protocols=OpenFlow13
    # increment IP index and namespace index
    IP_INDEX=$((IP_INDEX + 1))
    index=$((index + 1))
done
# Create full mesh connections between OVS switches
for i in "${!OVS_SWITCHES[@]}"; do # "${!OVS_SWITCHES[@]} expands to the index of each element in array"
    for ((j=i+1; j<${#OVS_SWITCHES[@]}; j++)); do # ${#OVS_SWITCHES[@]} gives the length of the array
        ovs1="${OVS_SWITCHES[$i]}"
        ovs2="${OVS_SWITCHES[$j]}"
        sudo ip link add "veth-$ovs1-$ovs2" type veth peer name "veth-$ovs2-$ovs1"
        sudo ovs-vsctl add-port "$ovs1" "veth-$ovs2-$ovs1"
        sudo ovs-vsctl add-port "$ovs2" "veth-$ovs1-$ovs2"
        sudo ip link set "veth-$ovs1-$ovs2" up
        sudo ip link set "veth-$ovs2-$ovs1" up
    done
done


# 3. Verification
# ping test between all namespaces
for ns1 in "${NAMESPACES[@]}"; do
    for ns2 in "${NAMESPACES[@]}"; do
        if [ "$ns1" != "$ns2" ]; then
            echo "Pinging from $ns1 to $ns2"
            sudo ip netns exec "$ns1" ping -c 3 "10.0.0.$(( ${ns2:1} ))"
        fi
    done
done

echo "Full mesh topology created successfully."
echo "OVS Switches: ${OVS_SWITCHES[*]}" # Expands all elements
echo "Namespaces: ${NAMESPACES[*]}"