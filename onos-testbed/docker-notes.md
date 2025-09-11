# Docker 
## Docker Engine Installtion on Ubuntu
1. Uninstall previous docker or default installation from linux distribution to avoid conflit.
    ```bash
    for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
    ```
2. Follow `apt` installation guide from step 1 to 3.

3. If verification unsuccessful. Try:
    1. Start the docker
        ```bash
        sudo systemctl start docker
        ```
    2. Enable docker to start on boot
        ```bash
        sudo systemctl enable docker
        ```
    3. Verification
        ```bash
        sudo systemctl status docker
        ```

4. [Post-installation steps for non-root users](https://docs.docker.com/engine/install/linux-postinstall/)

[Reference](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)


## Docker Commands
1. `docker ps`= showing containers list (process status).
2. `docker exec -it <container><command>`= execute commands to container
    - `-i` or `--interactive`: Keeps the container's standard input (STDIN) open, which is necessary to allow commands to be typed into the terminal.
    - `-t` or `--tty`: Allocates a pseudo-terminal (a TTY) for the container. Without this, the shell prompt and command output would not be properly formatted and would be difficult to read.
## Docker Compose Commands (v2)
1. `docker compose up`= start containers by following docker-compose.yml of current working directory.
2. `docker compose down`= stop and remove containers.

    | What Happens                                    | Explanation                                                                               |
    | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
    | **Containers deleted**                          | All containers defined in the Compose file are stopped and removed.                       |
    | **Default networks removed**                    | If Compose created a custom bridge network (e.g., `onos-testbed_default`), it is deleted. |
    | **Volumes** (data) **NOT deleted** (by default) | Your persistent volumes stay. Use `--volumes` to delete them too.                         |
    | **Images NOT deleted**                          | The images you pulled or built remain.                                                    |
    | **Port mappings cleared**                       | Port forwarding rules vanish because the containers (and their network) are removed.      |
    | **Custom networks** (manually created)          | Remain untouched unless explicitly removed.                                               |

3. `docker compose ps`= process status of containers in compose file of current **working directory**.
