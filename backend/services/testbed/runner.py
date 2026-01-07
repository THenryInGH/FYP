from __future__ import annotations

import json
import os
import subprocess
from typing import Any, Dict, Optional


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


def _safe_json_loads(raw: str) -> Optional[Dict[str, Any]]:
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def _iperf_summary(*, protocol: str, client_json: Dict[str, Any]) -> Dict[str, Any]:
    end = client_json.get("end") if isinstance(client_json.get("end"), dict) else {}
    result: Dict[str, Any] = {}

    if protocol == "udp":
        sum_ = end.get("sum") if isinstance(end.get("sum"), dict) else {}
        bps = sum_.get("bits_per_second")
        result["throughput_mbps"] = (bps / 1_000_000) if isinstance(bps, (int, float)) else None
        result["jitter_ms"] = sum_.get("jitter_ms") if isinstance(sum_.get("jitter_ms"), (int, float)) else None
        result["loss_pct"] = sum_.get("lost_percent") if isinstance(sum_.get("lost_percent"), (int, float)) else None
        result["lost_packets"] = sum_.get("lost_packets") if isinstance(sum_.get("lost_packets"), int) else None
        result["packets"] = sum_.get("packets") if isinstance(sum_.get("packets"), int) else None
        return result

    # tcp
    sum_recv = end.get("sum_received") if isinstance(end.get("sum_received"), dict) else {}
    bps = sum_recv.get("bits_per_second")
    result["throughput_mbps"] = (bps / 1_000_000) if isinstance(bps, (int, float)) else None
    sum_sent = end.get("sum_sent") if isinstance(end.get("sum_sent"), dict) else {}
    result["retransmits"] = sum_sent.get("retransmits") if isinstance(sum_sent.get("retransmits"), int) else None
    return result


def iperf(
    *,
    src_ns: str,
    dst_ns: str,
    dst_ip: str,
    protocol: str,
    port: int = 5201,
    duration_seconds: int = 5,
    udp_mbps: int = 10,
    tos: Optional[str] = None,
) -> Dict[str, Any]:
    args = [
        "iperf",
        src_ns,
        dst_ns,
        dst_ip,
        protocol,
        str(port),
        str(duration_seconds),
    ]
    if protocol == "udp":
        args.append(str(udp_mbps))
    if tos:
        # If tcp: tos is the 8th arg; if udp: it's the 9th arg.
        if protocol != "udp":
            args.append("")
        args.append(tos)

    result = _run_sudo(args, timeout_s=duration_seconds + 15)
    if not result.get("ok"):
        return result

    client_raw = result.get("client_raw") if isinstance(result.get("client_raw"), str) else ""
    client_json = _safe_json_loads(client_raw)
    if client_json:
        result["summary"] = _iperf_summary(protocol=protocol, client_json=client_json)
    else:
        result["summary"] = {"throughput_mbps": None}
        result["client_parse_error"] = "iperf3 output was not valid JSON"
    return result


__all__ = ["list_namespaces", "ping", "iperf"]




