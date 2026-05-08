# Deployment Instructions

The recommended deployment strategy is Docker.
A `Dockerfile` as well as a `docker-compose.yml` are provided for quick and reproducible deployments.

## Prerequisites

Ensure that Docker, Docker Compose and Caddy are installed on the system and configured as services/enabled.

<details>
<summary>alpine-specific instructions</summary>

```bash
apk update
apk add docker docker-cli-compose caddy
rc-update add docker default
rc-update add caddy default
service docker start
service caddy start
```

</details>


## Running the server


Proceed with the following steps:

```bash
git clone <repository_url> readoutto-me
cd readoutto-me

docker compose up -d
```

To restart the server and apply changes, execute in the project directory:
```bash
git pull
docker compose down
docker compose up --build -d
```

## Reverse Proxy

Now that the server is running, a reverse proxy to route traffic from the domain to the docker container should be configured.
For this purpose, caddy is used.

Install caddy and the corresponding service from your package manager and modify the `Caddyfile`, possibly living in `/etc/caddy/Caddyfile` depending on your package manager / service:

```Caddyfile
readoutto.me {
  reverse_proxy localhost:8023
}
```

Apply the changes by restarting the service or running `service caddy reload` if supported.

Ensure the DNS records of the domain point to the server's ip address properly.

Now, the application should be accessible from the domain and automatically be configured for HTTPS as well.
