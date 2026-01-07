from __future__ import annotations

from pydantic import BaseModel, Field


class PingTestRequest(BaseModel):
    src_ns: str = Field(min_length=2, max_length=32)
    dst_ip: str = Field(min_length=7, max_length=15)
    count: int = Field(default=3, ge=1, le=10)
    timeout_seconds: int = Field(default=6, ge=1, le=20)


class IperfTestRequest(BaseModel):
    src_ns: str = Field(min_length=2, max_length=32)
    dst_ns: str = Field(min_length=2, max_length=32)
    dst_ip: str = Field(min_length=7, max_length=15)
    protocol: str = Field(pattern="^(tcp|udp)$")
    port: int = Field(default=5201, ge=1, le=65535)
    duration_seconds: int = Field(default=5, ge=1, le=60)
    udp_mbps: int = Field(default=10, ge=1, le=10_000)
    tos: str | None = Field(default=None, pattern=r"^0x[0-9a-fA-F]{1,2}$")




