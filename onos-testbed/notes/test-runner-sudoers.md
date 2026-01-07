# Netns test runner (sudo allowlist)

Your FastAPI backend should **not** run as root. Instead, allow it to execute a **single, allowlisted** script with sudo so you can run `ip netns exec ...` safely.

## 1) Install the runner somewhere stable

The repo includes:

- `onos-testbed/scripts/fyp-netns-test.sh`

Recommended location on the server:

- `/usr/local/bin/fyp-netns-test`

Example:

```bash
sudo install -m 0755 "/home/henry/FYP/onos-testbed/scripts/fyp-netns-test.sh" /usr/local/bin/fyp-netns-test
```

## 2) Add a sudoers rule (passwordless, allowlisted)

Edit sudoers using `visudo`:

```bash
sudo visudo
```

Add a rule like (adjust the username `henry` and path if needed):

```text
henry ALL=(root) NOPASSWD: /usr/local/bin/fyp-netns-test *
```

This permits running only the test runner script as root (and nothing else).

## 3) Point backend to the installed path

Set environment variable for the backend process:

```bash
export NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test
```

Then restart uvicorn.

## Security notes

- The runner validates inputs (namespace names like `h1`, IPv4 format, count/timeout ranges).
- Do not allow `sudo` for arbitrary commands.
- Keep timeouts enabled to prevent hung processes.




