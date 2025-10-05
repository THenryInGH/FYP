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

# 3. Host environment setup
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
- Setup ovs
```bash
sudo apt update 
sudo apt install openvswitch-switch
# verify installation
sudo ovs-vsctl show
# sudo is required as this command is accessing ovsdb-server
```
- Setup ONOS
  1. Follow [wiki admin setup](https://wiki.onosproject.org/display/ONOS/Administrator+Guide)
  ```bash
  # add a user sdn
  sudo adduser sdn --system --group
  # adding user named sdn in system and group

  # install java
  sudo apt install openjdk-11-jdk
  # set java home
  sudo nano /etc/environment
  JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
  JRE_HOME=/usr/lib/jvm/java-11-openjdk-amd64

  cd /opt
  # install tar.gz
  sudo wget -c https://repo1.maven.org/maven2/org/onosproject/onos-releases/2.7.0/onos-2.7.0.tar.gz
  # untar
  sudo tar xzf onos-2.7.0.tar.gz
  # rename dir
  sudo mv onos-2.7.0 onos

  # start service from script
  sudo /opt/onos/bin/onos-service start

  ```
  2. Failed to start `/opt/onos/bin/onos-service start`
  - error: ERROR [BootFeaturesInstaller] 
  `Error installing boot features org.osgi.framework.`
    
    Reason: 
    - OpenJDK with version > 11.0.20 require a new environment variable, `JAVA_TOOL_OPTIONS`
    - Causing invalid CEN header when booting ONOS feature

    Solution:
    - Try to set `JAVA_TOOL_OPTIONS` (failed)
    ```bash
    # Per-session solution
    export JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -Djdk.util.zip.disableZip64ExtraFieldValidation=true"
    # system wide 
    sudo nano /etc/environment
    JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
    JRE_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
    JAVA_TOOL_OPTIONS="-Djdk.util.zip.disableZip64ExtraFieldValidation=true"
    source /etc/environment

    # for systemd service
    sudo nano /etc/systemd/system/onos.service
    # under [Service]
    Environment="JAVA_TOOL_OPTIONS=-Djdk.util.zip.disableZip64ExtraFieldValidation=true"
    # reload and restart
    sudo systemctl daemon-reexec
    sudo systemctl restart onos
    ```
    - Downgrade jdk
    ```bash
    # Download Zulu JDK 11.0.8 manually
    cd /opt 
    sudo wget https://cdn.azul.com/zulu/bin/zulu11.41.23-ca-jdk11.0.8-linux_x64.tar.gz
    # Extract and install
    sudo tar -xvf zulu11.41.23-ca-jdk11.0.8-linux_x64.tar.gz
    sudo mv zulu11.41.23-ca-jdk11.0.8-linux_x64 zulu-11.0.8
    # Register Zulu JDK with alternatives
    sudo update-alternatives --install /usr/bin/java java /opt/zulu-11.0.8/bin/java 1
    sudo update-alternatives --install /usr/bin/javac javac /opt/zulu-11.0.8/bin/javac 1
    # Switch to Zulu
    sudo update-alternatives --config java

    ```
  3. Running ONOS as a service
  ```bash
  # copy the init file
  sudo cp /opt/onos/init/onos.initd /etc/init.d/onos
  # steps for systemd based system
  sudo cp /opt/onos/init/onos.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable onos
  ```
  4. Debug steps
  ```bash
  # check systemd service state
  systemctl status onos
  # check ONOS log
  tail -f /opt/onos/apache-karaf-4.2.9/data/log/karaf.log
  # the log that will start if ONOS boot successfully
  tail -f /opt/onos/apache-karaf-4.2.9/data/log/karaf.log
  # check if karaf port is listening  
  ```

  5. [Access to ONOS CLI and GUI](/onos-testbed/notes/onos.md#logs)
  
# 4. Setup a simple testbed locally
  ```bash
  # 1. Create namespaces (end hosts)
  sudo ip netns add h1
  sudo ip netns add h2

  # 2. Create veth pairs 
  sudo ip link add veth-br-h1 type veth peer name veth-h1-br
  sudo ip link add veth-br-h2 type veth peer name veth-h2-br

  # 3. Assign veth to netns
  sudo ip link set veth-br-h1 netns h1
  sudo ip link set veth-br-h2 netns h2

  # 4. Assign IPs inside namespace (for L3 purpose)
  sudo ip netns exec h1 ip addr add 10.0.0.1/24 dev veth-br-h1
  sudo ip netns exec h1 ip link set veth-br-h1 up
  
  sudo ip netns exec h2 ip addr add 10.0.0.2/24 dev veth-br-h2
  sudo ip netns exec h2 ip link set veth-br-h2 up

  # 5. Create OVS bridge & attach ports
  sudo ovs-vsctl add-br s1
  sudo ovs-vsctl add-port s1 veth-h1-br
  sudo ovs-vsctl add-port s1 veth-h2-br

  # 6. Activate openflow applications on ONOS
  ssh onos-local
  apps -a -s
  app activate org.onosproject.openflow
  # Verification
  # show listening port 
  ss -tulpn | grep 6653
  # check which process own the port
  sudo lsof -i :6653
  # Instead of just looking at the server, this initiates a TCP handshake to confirm the port is reachable.
  nc -zv 127.0.0.1 6653

  # 7. Point OVS to ONOS controller
  sudo ovs-vsctl set-controller s1 tcp:127.0.0.1:6653

  # 8. Verify ONOS sees the devices
  curl -u onos:rocks http://127.0.0.1:8181/onos/v1/devices

  # 9. Step 8 showing failed connection (OpenFlow version mismatch, ONOS use OpenFlow 13 by default, force ovs to use it)
  sudo ovs-vsctl set bridge s1 protocols=OpenFlow13
  # To check OpenFlow version ovs using
  sudo ovs-vsctl get bridge <bridge-name> protocols
  # [] output indicate, no specific version is set

  # 10. ONOS cannot view namespace by default unless namespaces transfered traffic using ovs
  sudo ip netns exec h1 ping -c 3 10.0.0.2 

  # 11. Ping failed, interfaces not up
  # Note: Interfaces assigned to namespaces are invisible in host ip addr
  sudo ip link set veth-h1-br up 
  sudo ip link set veth-h2-br up
  # ovs-system can be ignored (dummy interface created by OVS to manage its internal datapath )
  # s1: need to bring it up
  sudo ip link set s1 up

  # 12. s1 state change from DOWN to UNKNOWN and ping failed
  # UNKNOWN is because no IP is assigned to s1
  # Forgot to activate forwarding on onos
  ssh onos-local
  app activate org.onosproject.fwd

  # Success!!!
  ```

# 5. REST API Learning and Usage
[Note](/onos-testbed/notes/rest-api.md)

# 6. Bash Learning 
[Note](/onos-testbed/notes/bash.md)

# 7. Testbed Script 
- [Clean up](/onos-testbed/scripts/clean-topo.sh)
- [Test simple topo](/onos-testbed/scripts/test-topo.sh)
  
  `ping` failed from h1 to h2
  - the folder of `org.onosproject.fwd` even missing in `/opt/onos/apps`

  Cause:

  Solution:
  - install back onos-apps-fwd from `feature:repo-add mvn:org.onosproject/onos-apps-fwd/2.7.0/xml/features` in onos-cli
  - `feature:install onos-apps-fwd `
  - However, GUI and `apps -a -s` still cannot find org.onosproject.fwd
  - ONOS has two layers, **karaf** layer (`feature:list`) and **GUI** layer (`apps -a -s`) 
  - Can verify by checking are all hosts exist on ONOS GUI and `sudo ovs-ofctl -O OpenFlow13 dump-flows s1`
  - Planning to 
- [Tree topo](/onos-testbed/scripts/tree-topo.sh)
  - Testing:
    - show fwd app running, show netns, show veth, show ovs, show ovs_of
- [Mesh topo](/onos-testbed/scripts/mesh-topo.sh)
  - `fwd` missing happened again

# 8. Testbed planning update
- keep topology single subnet
- use Intent based framework first
- discover cross subnet and custom intent compiler