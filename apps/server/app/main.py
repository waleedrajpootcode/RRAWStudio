from fastapi import FastAPI

from .api.projects import router as projects_router
from .db.migrations import initialize_database

initialize_database()

app = FastAPI(
    title="RRAW Studio API",
    version="0.1.0",
)

app.include_router(projects_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "rraw-studio-api",
        "version": "0.1.0",
    }
