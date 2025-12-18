from __future__ import annotations

import os
from typing import Any, Dict, Optional

import requests
from dotenv import load_dotenv

load_dotenv()

# Keep current default, but allow override via env.
ONOS_API_URL = os.getenv("ONOS_API_URL", "http://10.100.10.122:8181/onos/v1/")
ONOS_USER = os.getenv("ONOS_USER", "onos")
ONOS_PASS = os.getenv("ONOS_PASS", "rocks")


def _auth() -> tuple[str, str]:
    return (ONOS_USER, ONOS_PASS)

def _request(method: str, path: str, *, json: Any | None = None) -> requests.Response:
    url = f"{ONOS_API_URL}{path.lstrip('/')}"
    return requests.request(method, url, auth=_auth(), timeout=10, json=json)


def get_network_info() -> Dict[str, Any]:
    return {
        "devices": get_network_devices(),
        "links": get_network_links(),
        "hosts": get_network_hosts(),
        "intents": get_network_intents(),
        "flows": get_network_flows(),
    }


def get_network_devices() -> Dict[str, Any]:
    response = _request("GET", "devices")
    response.raise_for_status()
    return response.json()


def get_network_links() -> Dict[str, Any]:
    response = _request("GET", "links")
    response.raise_for_status()
    return response.json()


def get_network_hosts() -> Dict[str, Any]:
    response = _request("GET", "hosts")
    response.raise_for_status()
    return response.json()


def get_network_intents() -> Dict[str, Any]:
    response = _request("GET", "intents")
    response.raise_for_status()
    return response.json()


def get_network_flows() -> Dict[str, Any]:
    response = _request("GET", "flows")
    response.raise_for_status()
    return response.json()


def post_intent(payload: Dict[str, Any]) -> Dict[str, Any] | None:
    response = _request("POST", "intents", json=payload)
    if not response.ok:
        response.raise_for_status()
    if not response.text:
        return None
    return response.json()


def delete_intent(app_id: str, key: str) -> bool:
    response = _request("DELETE", f"intents/{app_id}/{key}")
    if not response.ok:
        response.raise_for_status()
    return True


__all__ = [
    "get_network_info",
    "get_network_devices",
    "get_network_links",
    "get_network_hosts",
    "get_network_intents",
    "get_network_flows",
    "post_intent",
    "delete_intent",
]

