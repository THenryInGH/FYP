# Mininet
[Mininet docker image](https://hub.docker.com/r/iwaseyusuke/mininet)

[Mininet docker image author GitHub](https://github.com/iwaseyusuke/docker-mininet/tree/main)

## Logs:
### Manual:
1. `docker exec -it mininet bash`
2. custom the topology
    ```bash
    mn --custom /opt/topo/hybrid_topo.py --topo hybrid_mesh_tree_topo --controller=remote,ip=10.0.0.10,port=6653
    ```
### Command:
1. 

## Debug methods
1. test ping 
## Container-Host Sync Strategies
1. mount topo directory
2. create custom docker file when first version come out

