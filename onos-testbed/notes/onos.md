# ONOS
[ONOS Wiki](https://wiki.onosproject.org/)

[ONOS official docker image](https://hub.docker.com/r/onosproject/onos)

[CLI Command](https://wiki.onosproject.org/display/ONOS/Appendix+A+%3A+CLI+commands)
## Apache Karaf
- lightweight OSGi-based runtime for running modular Java applications.
- provides a runtime environment + command-line shell where apps (called bundles) can be installed, started, or stopped dynamically
- ONOS is built on top of Karaf, so ONOS itself runs inside this Karaf container.
- SSH to ONOS port 8101 = connect to Karaf CLI
- ONOS CLI = typing ONOS-specified commands on Karaf CLI

## Logs:
1. Access to ONOS CLI
    - [Inside local host](https://wiki.onosproject.org/display/ONOS/Accessing+the+CLI+and+GUI) 
        - CLI
        ```bash
        ssh -p 8101 -o PubkeyAcceptedAlgorithms=+ssh-rsa -o HostKeyAlgorithms=+ssh-rsa karaf@localhost
        # define ssh-rsa since modern ubuntu ssh disabled it by default

        # another way (set a ssh user and config)
        sudo nano  ~/.ssh/config
        # inside config
        Host onos-local
        HostName 127.0.0.1
        Port 8101
        User karaf
        HostKeyAlgorithms +ssh-rsa
        PubkeyAcceptedAlgorithms +ssh-rsa
        # Fix permissions
        chmod 600 ~/.ssh/config
        # ssh 
        ssh onos-local
        ```
        - GUI
            
            http://HOST-IP:8181/onos/ui/index.html
        
        
    - Inside docker image (ONOS 2.7.0)
        - Option 1: Use Karaf’s built-in client directly
        1. From host or `docker exec -it onos bash` to ONOS bash
        2. Run:
            ```bash
            ./apache-karaf-4.2.9/bin/client
            # or, note that karaf version may different for different onos version
            ./bin/karaf

            ```
        - Option 2: Use SSH to Access ONOS CLI
        1. From host or `docker exec -it onos bash` to ONOS bash
        2. SSH using karaf
            ```bash
            ssh -p 8101 karaf@localhost
            ```

        - Option 3: Exec into the Container & Use CLI directly
            ```bash
            docker exec -it onos /bin/bash
            ./bin/onos localhost
            ```
        - Options 2 & 3 require SSH installation on ONOS container

2. Default ONOS Karaf CLI credentials are:

    Username: `karaf`

    Password: `karaf`

3. To quit from CLI: `logout`

4. Install networking packages for debug:
    ```bash
    docker exec -it onos bash
    apt update && apt install -y iproute2 iputils-ping tcpdump
    # ping: check if destination reachable
    # ip: configure/show interfaces, routes & addresses
    # ss: view socket connection
    # tcpdump: sniff packets at link level
    ```

## Container-Host Sync Strategies
1. export networks.json using API
2. mount config files
    1. `docker exec -it onos bash`
    2. `ls root/onos -type -f | grep cfg`