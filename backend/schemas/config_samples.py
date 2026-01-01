from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class ConfigSampleCreateRequest(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    intent_text: str = Field(min_length=5)
    # Allow any valid JSON (dict/list/etc). Your existing DB rows include lists.
    config_json: Any
    extra_metadata: Any | None = None


class ConfigSamplePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sample_id: int
    category: str | None = None
    intent_text: str | None = None
    config_json: Any | None = None
    extra_metadata: Any | None = None

