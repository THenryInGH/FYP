from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.chat import router as chat_router
from backend.api.onos import router as onos_router


def create_app() -> FastAPI:
    app = FastAPI(title="FYP Backend API")

    # Keep the existing permissive CORS behavior for now.
    # Tighten this later when you know the frontend origin(s).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Keep paths stable: /generate is what the frontend calls today.
    app.include_router(chat_router)

    # New: backend-owned ONOS proxy endpoints (optional to adopt on frontend).
    app.include_router(onos_router, prefix="/onos", tags=["onos"])

    @app.get("/")
    def root() -> dict[str, str]:
        return {"message": "FYP Backend is running"}

    return app


app = create_app()

