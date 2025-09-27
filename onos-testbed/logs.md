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
  tail -f /opt/onos/apache-karaf-4.2.9/data/log/onos.log
  # check if karaf port is listening  
  ```
