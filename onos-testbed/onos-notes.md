# ONOS
[ONOS official docker image](https://hub.docker.com/r/onosproject/onos)
## Logs:

## Container-Host Sync Strategies
1. export networks.json using API
2. mount config files
    1. `docker exec -it onos bash`
    2. `ls root/onos -type -f | grep cfg`