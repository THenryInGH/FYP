from __future__ import annotations

import os
from typing import Any, Dict

import requests
from dotenv import load_dotenv

load_dotenv()

# Keep current default, but allow override via env.
ONOS_API_URL = os.getenv("ONOS_API_URL", "http://10.100.10.122:8181/onos/v1/")
ONOS_USER = os.getenv("ONOS_USER", "onos")
ONOS_PASS = os.getenv("ONOS_PASS", "rocks")


def _auth() -> tuple[str, str]:
    return (ONOS_USER, ONOS_PASS)


def get_network_info() -> Dict[str, Any]:
    return {
        "devices": get_network_devices(),
        "links": get_network_links(),
        "hosts": get_network_hosts(),
        "intents": get_network_intents(),
        "flows": get_network_flows(),
    }


def get_network_devices() -> Dict[str, Any]:
    response = requests.get(f"{ONOS_API_URL}devices", auth=_auth(), timeout=10)
    response.raise_for_status()
    return response.json()


def get_network_links() -> Dict[str, Any]:
    response = requests.get(f"{ONOS_API_URL}links", auth=_auth(), timeout=10)
    response.raise_for_status()
    return response.json()


def get_network_hosts() -> Dict[str, Any]:
    response = requests.get(f"{ONOS_API_URL}hosts", auth=_auth(), timeout=10)
    response.raise_for_status()
    return response.json()


def get_network_intents() -> Dict[str, Any]:
    response = requests.get(f"{ONOS_API_URL}intents", auth=_auth(), timeout=10)
    response.raise_for_status()
    return response.json()


def get_network_flows() -> Dict[str, Any]:
    response = requests.get(f"{ONOS_API_URL}flows", auth=_auth(), timeout=10)
    response.raise_for_status()
    return response.json()


__all__ = [
    "get_network_info",
    "get_network_devices",
    "get_network_links",
    "get_network_hosts",
    "get_network_intents",
    "get_network_flows",
]

