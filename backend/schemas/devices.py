from __future__ import annotations

from pydantic import BaseModel, Field


class DeviceNameUpdateRequest(BaseModel):
    name: str | None = Field(default=None, max_length=100)

