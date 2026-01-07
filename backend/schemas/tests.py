from __future__ import annotations

from pydantic import BaseModel, Field


class PingTestRequest(BaseModel):
    src_ns: str = Field(min_length=2, max_length=32)
    dst_ip: str = Field(min_length=7, max_length=15)
    count: int = Field(default=3, ge=1, le=10)
    timeout_seconds: int = Field(default=6, ge=1, le=20)




