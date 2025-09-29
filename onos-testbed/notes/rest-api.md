# REST API 
**API(Application Programming Interface)**= a way for programs to talk to each other
**REST(Representational State Transfer)**= a style of API that uses HTTP

## Key ideas:
- Interact with resources (like devices, hosts, intents) using URLs.
- Use standard HTTP methods:
    1. `GET`: retrieve info
    2. `POST`: create something
    3. `PUT`: update something
    4. `DELETE`: remove something

- Examples:
```http
GET https://api.github.com/users/Henry/repos
```
- Returns GitHub repos as JSON.

# REST API in ONOS
- REST API let's ONOS programmable
**In ONOS:**
- `GET /onos/v1/devices` → list all switches

- `GET /onos/v1/hosts` → list all end-hosts

- `GET /onos/v1/links` → list links between devices

- `POST /onos/v1/intents` → install an intent (e.g., connect host A to B)

- `DELETE /onos/v1/intents/{appId}/{key}` → remove an intent

## User Manual
### Authentication
- Default: `username = onos`, `password = rocks`
- Send with `curl -u onos:rocks ...`