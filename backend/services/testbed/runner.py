from __future__ import annotations

import json
import os
import subprocess
from typing import Any, Dict


def _runner_path() -> str:
    return os.getenv(
        "NETNS_TEST_RUNNER",
        os.path.join(os.getcwd(), "onos-testbed", "scripts", "fyp-netns-test.sh"),
    )


def _run_sudo(args: list[str], *, timeout_s: int = 15) -> Dict[str, Any]:
    """
    Run the allowlisted netns test runner with sudo and return parsed JSON.

    IMPORTANT: This intentionally does not accept arbitrary shell strings.
    """
    # Use non-interactive sudo (-n) so the backend never hangs waiting for a password.
    cmd = ["sudo", "-n", _runner_path(), *args]
    try:
        completed = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_s,
        )
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "error": f"test runner timed out after {timeout_s}s",
            "exit_code": 124,
        }
    stdout = (completed.stdout or "").strip()
    stderr = (completed.stderr or "").strip()

    # Runner returns JSON on stdout; if it's not JSON, return a structured error.
    try:
        data = json.loads(stdout) if stdout else {"ok": False, "error": "empty output"}
    except json.JSONDecodeError:
        data = {"ok": False, "error": "runner returned non-JSON", "stdout": stdout, "stderr": stderr}

    # Attach stderr/exit_code for debugging if runner didn't include them.
    data.setdefault("exit_code", completed.returncode)
    if stderr and "stderr" not in data:
        data["stderr"] = stderr
    if not data.get("ok") and isinstance(data.get("stderr"), str) and "a password is required" in data["stderr"]:
        data["hint"] = (
            "sudo is asking for a password. Configure NOPASSWD for NETNS_TEST_RUNNER "
            "(see onos-testbed/notes/test-runner-sudoers.md)."
        )
    return data


def list_namespaces() -> Dict[str, Any]:
    return _run_sudo(["list"], timeout_s=10)


def ping(*, src_ns: str, dst_ip: str, count: int = 3, timeout_seconds: int = 6) -> Dict[str, Any]:
    return _run_sudo(["ping", src_ns, dst_ip, str(count), str(timeout_seconds)], timeout_s=timeout_seconds + 3)


__all__ = ["list_namespaces", "ping"]




