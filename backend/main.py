# help to avoid import/type errors
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.auth import router as auth_router
from backend.api.chat import router as chat_router
from backend.api.chat_conversations import router as chat_conversations_router
from backend.api.config_samples import router as config_samples_router
from backend.api.devices import router as devices_router
from backend.api.hosts import router as hosts_router
from backend.api.onos import router as onos_router
from backend.api.tests import router as tests_router
import os


def create_app() -> FastAPI:
    app = FastAPI(title="FYP Backend API")

    origins_env = os.getenv("FRONTEND_ORIGINS")
    allow_origins = ["*"] if not origins_env else [o.strip() for o in origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        # Regex helps when the origin varies (e.g. ssh port-forwarding, different hostnames).
        allow_origin_regex=os.getenv("FRONTEND_ORIGIN_REGEX", ".*") if allow_origins == ["*"] else None,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Keep paths stable: /generate is what the frontend calls today.
    app.include_router(chat_router)
    app.include_router(chat_conversations_router)

    # Auth (register/login/me)
    app.include_router(auth_router)

    # Device name management (global friendly names)
    app.include_router(devices_router)

    # Host name management (stored in devices table, type='host')
    app.include_router(hosts_router)

    # Config samples library (RAG examples)
    app.include_router(config_samples_router)

    # Testbed verification endpoints (ping/iperf)
    app.include_router(tests_router)

    # New: backend-owned ONOS proxy endpoints (optional to adopt on frontend).
    app.include_router(onos_router, prefix="/onos", tags=["onos"])

    @app.get("/")
    def root() -> dict[str, str]:
        return {"message": "FYP Backend is running"}

    return app


app = create_app()

