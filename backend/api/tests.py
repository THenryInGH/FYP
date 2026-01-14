from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from backend.schemas.tests import IperfTestRequest, PingTestRequest
from backend.services.auth.deps import get_current_user
from backend.services.testbed.runner import iperf, list_namespaces, ping

router = APIRouter(prefix="/tests", tags=["tests"])

def _detail_from_runner(result: Dict[str, Any], default: str) -> str:
    if isinstance(result.get("hint"), str) and result["hint"]:
        return result["hint"]
    if isinstance(result.get("stderr"), str) and result["stderr"]:
        return result["stderr"][:500]
    if isinstance(result.get("stdout"), str) and result["stdout"]:
        return result["stdout"][:500]
    if isinstance(result.get("error"), str) and result["error"]:
        return result["error"]
    return default


@router.get("/namespaces")
def namespaces(_current_user=Depends(get_current_user)) -> Dict[str, Any]:
    result = list_namespaces()
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=_detail_from_runner(result, "Failed to list namespaces"),
        )
    return result


@router.post("/ping")
def ping_test(req: PingTestRequest, _current_user=Depends(get_current_user)) -> Dict[str, Any]:
    result = ping(
        src_ns=req.src_ns,
        dst_ip=req.dst_ip,
        count=req.count,
        timeout_seconds=req.timeout_seconds,
    )
    # If the runner executed and produced a structured ping result, return it even if unreachable.
    # This lets the UI show loss/RTT/raw output instead of a generic error.
    if result.get("type") == "ping":
        return result
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=_detail_from_runner(result, "Ping failed"),
        )
    return result


@router.post("/iperf")
def iperf_test(req: IperfTestRequest, _current_user=Depends(get_current_user)) -> Dict[str, Any]:
    result = iperf(
        src_ns=req.src_ns,
        dst_ns=req.dst_ns,
        dst_ip=req.dst_ip,
        protocol=req.protocol,
        port=req.port,
        duration_seconds=req.duration_seconds,
        udp_mbps=req.udp_mbps,
        tos=req.tos,
    )
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=_detail_from_runner(result, "iperf failed"),
        )
    return result



