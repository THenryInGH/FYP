# ONOS
[ONOS Wiki](https://wiki.onosproject.org/)

[ONOS official docker image](https://hub.docker.com/r/onosproject/onos)

## Apache Karaf
- lightweight OSGi-based runtime for running modular Java applications.
- provides a runtime environment + command-line shell where apps (called bundles) can be installed, started, or stopped dynamically
- ONOS is built on top of Karaf, so ONOS itself runs inside this Karaf container.
- SSH to ONOS port 8101 = connect to Karaf CLI
- ONOS CLI = typing ONOS-specified commands on Karaf CLI

## Logs:
1. Access to ONOS CLI
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

## Container-Host Sync Strategies
1. export networks.json using API
2. mount config files
    1. `docker exec -it onos bash`
    2. `ls root/onos -type -f | grep cfg`