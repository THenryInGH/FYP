from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from backend.schemas.tests import PingTestRequest
from backend.services.auth.deps import get_current_user
from backend.services.testbed.runner import list_namespaces, ping

router = APIRouter(prefix="/tests", tags=["tests"])


@router.get("/namespaces")
def namespaces(_current_user=Depends(get_current_user)) -> Dict[str, Any]:
    result = list_namespaces()
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("hint") or result.get("error") or "Failed to list namespaces",
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
    if not result.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("hint") or result.get("error") or "Ping failed",
        )
    return result




