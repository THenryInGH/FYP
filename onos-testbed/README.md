# Testbed

## SDN Controller
[**ONOS**](https://opennetworking.org/onos/)

## Switches
[**Open vSwitch**](https://www.openvswitch.org/)

- Open vSwitch version: `3.3.0`
- OpenFlow version support: `1.0 - 1.5`

## Host
[Linux namespace](https://man7.org/linux/man-pages/man7/namespaces.7.html) 

## Link
[veth](https://man7.org/linux/man-pages/man4/veth.4.html)

## Bandwidth
- refer [note](/onos-testbed/notes/bandwidth.md)

## Container
[**Docker**](https://www.docker.com/)
### Version:
1. Docker: 
    - client: `28.4.0`
    - server: `28.4.0`
2. Docker compose: `v2.39.2`

## Network emulator 
[**Mininet**](https://mininet.org/)(outdated)
Currently, bash scripts are used to setup the testbed and docker is 

## Steps to setup
1. make sure on the right location:
```bash
cd onos-testbed
```
2. start the docker compose:
```bash
docker compose up
```


