# 0. Before moving project here
- setup docker, docker-compose with help of AI
- python script for custom tree/mesh hybrid topology
- changing to learn from docs (AI is not reliable)

# 1. Setup Docker
1. Followed docker documentation and activate service in systemctl
2. Upgrade docker-compose to docker compose v2
3. Record notes and setup dir structure.
# 2. Connection between containers failed
1. Inspect docker network
```bash
docker network ls
docker network inspect onos-testbed_testbed-net
```
2. Check connectivity
- many issues, onos image don't have network debugging tools by default and apt cannot work
- thinking of too wasting time to debug docker but no directly touching SDN and Linux net
- plan to move to ONOS + Namespace + ovs on host directly.

# Host environment setup
## Cleanning environment
```bash
# Stop any Mininet processes (if running)
sudo mn -c  

# Delete all namespaces
for ns in $(ip netns list | awk '{print $1}'); do
  sudo ip netns delete $ns
done

# Delete OVS bridges
for br in $(sudo ovs-vsctl list-br); do
  sudo ovs-vsctl del-br $br
done

# Delete stray veth pairs
for v in $(ip link show type veth | grep -oE '^[0-9]+: [^:@]+' | cut -d' ' -f2); do
  sudo ip link delete $v type veth 2>/dev/null
done

# Delete stray docker network (looks more tidy)
sudo ip link delete br-xxxxxxxxxxxx
```
## Setup environment