from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None


@router.get("/{project_id}")
def get_project(project_id: str):
    connection = get_connection()
    project = connection.execute(
        """
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        WHERE id = ?
        """,
        (project_id,),
    ).fetchone()
    connection.close()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")

    return dict(project)


@router.patch("/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate):
    if payload.name is not None and not payload.name.strip():
        raise HTTPException(status_code=400, detail="Project name cannot be empty.")

    if payload.status is not None and payload.status not in {"active", "archived"}:
        raise HTTPException(
            status_code=400,
            detail="Project status must be active or archived.",
        )

    updates = []
    values = []

    if payload.name is not None:
        updates.append("name = ?")
        values.append(payload.name.strip())

    if payload.description is not None:
        updates.append("description = ?")
        values.append(payload.description.strip())

    if payload.status is not None:
        updates.append("status = ?")
        values.append(payload.status)

    if not updates:
        raise HTTPException(status_code=400, detail="No project changes supplied.")

    updates.append("updated_at = ?")
    values.append(datetime.now(timezone.utc).isoformat())
    values.append(project_id)

    connection = get_connection()

    existing = connection.execute(
        "SELECT id FROM projects WHERE id = ?",
        (project_id,),
    ).fetchone()

    if existing is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    connection.execute(
        f"UPDATE projects SET {', '.join(updates)} WHERE id = ?",
        values,
    )
    connection.commit()

    project = connection.execute(
        """
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        WHERE id = ?
        """,
        (project_id,),
    ).fetchone()
    connection.close()

    return dict(project)


@router.post("", status_code=201)
def create_project(payload: ProjectCreate):
    name = payload.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Project name is required.")

    project_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    connection = get_connection()
    connection.execute(
        """
        INSERT INTO projects (id, name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
        """,
        (project_id, name, payload.description.strip(), now, now),
    )
    connection.commit()

    project = connection.execute(
        """
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        WHERE id = ?
        """,
        (project_id,),
    ).fetchone()
    connection.close()

    return dict(project)


@router.get("")
def list_projects():
    connection = get_connection()
    projects = connection.execute(
        """
        SELECT id, name, description, status, created_at, updated_at
        FROM projects
        ORDER BY created_at DESC
        """
    ).fetchall()
    connection.close()

    return [dict(project) for project in projects]
