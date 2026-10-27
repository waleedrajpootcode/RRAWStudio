from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.projects import router as projects_router
from .db.migrations import initialize_database

initialize_database()

app = FastAPI(
    title="RRAW Studio API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "rraw-studio-api",
        "version": "0.1.0",
    }
