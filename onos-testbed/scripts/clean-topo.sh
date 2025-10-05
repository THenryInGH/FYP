#!/bin/bash

# Bash exit on error
set -e

# Clean up the testbed topology 
# Delete all OVS bridges (try here to avoid "device not found" error, since ovs may keep veth ref)
for br in $(sudo ovs-vsctl list-br); do
    sudo ovs-vsctl del-br $br
done

# Delete all network namespaces
sudo ip -all netns delete 

# Delete all veth pairs
ip -o link show | awk -F': ' '/veth/ {print $2}' \
  | cut -d'@' -f1 | sort -u \
  | xargs -r -n1 sudo ip link delete
# -o, --oneline: Print each record on a single line
# -F, --field-separator: Use the specified character as the field separator
# /veth/: Match lines containing 'veth'
# {print $2}: Print the second field (the interface name)
# xargs -r: Do not run the command if there are no input items
# -n1: Use at most one argument per command line
# cut statement is used to remove the '@ifX' suffix from the interface names to avoid errors (since the namespaces are deleted first, @ will make script cannot find the device error)

# Try restart ONOS after cleanup to avoid flow leftover