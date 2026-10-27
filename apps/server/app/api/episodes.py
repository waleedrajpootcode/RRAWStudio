from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection


router = APIRouter(prefix="/api/projects/{project_id}/episodes", tags=["episodes"])


class EpisodePayload(BaseModel):
    episode_number: int
    title: str = ""
    summary: str = ""
    story_id: str | None = None
    status: str = "draft"


class EpisodeUpdate(BaseModel):
    episode_number: int | None = None
    title: str | None = None
    summary: str | None = None
    story_id: str | None = None
    status: str | None = None


def _validate_status(status: str) -> None:
    if status not in {"draft", "approved"}:
        raise HTTPException(status_code=400, detail="Episode status must be draft or approved.")


def _project_exists(connection, project_id: str) -> bool:
    return connection.execute(
        "SELECT 1 FROM projects WHERE id = ?", (project_id,)
    ).fetchone() is not None


def _episode_from_row(row):
    return dict(row) if row else None


@router.get("")
def list_episodes(project_id: str):
    connection = get_connection()
    try:
        if not _project_exists(connection, project_id):
            raise HTTPException(status_code=404, detail="Project not found.")
        rows = connection.execute(
            """
            SELECT id, project_id, story_id, episode_number, title, summary,
                   status, created_at, updated_at
            FROM episodes
            WHERE project_id = ?
            ORDER BY episode_number ASC
            """,
            (project_id,),
        ).fetchall()
        return [_episode_from_row(row) for row in rows]
    finally:
        connection.close()


@router.post("")
def create_episode(project_id: str, payload: EpisodePayload):
    if payload.episode_number < 1:
        raise HTTPException(status_code=400, detail="Episode number must be at least 1.")
    _validate_status(payload.status)

    connection = get_connection()
    try:
        if not _project_exists(connection, project_id):
            raise HTTPException(status_code=404, detail="Project not found.")

        if payload.story_id:
            story = connection.execute(
                "SELECT 1 FROM stories WHERE id = ? AND project_id = ?",
                (payload.story_id, project_id),
            ).fetchone()
            if not story:
                raise HTTPException(status_code=400, detail="Story does not belong to this project.")

        now = datetime.now(timezone.utc).isoformat()
        episode_id = str(uuid4())

        try:
            connection.execute(
                """
                INSERT INTO episodes (
                    id, project_id, story_id, episode_number, title, summary,
                    status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    episode_id, project_id, payload.story_id, payload.episode_number,
                    payload.title, payload.summary, payload.status, now, now,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Episode number already exists in this project.")
            raise

        row = connection.execute(
            "SELECT id, project_id, story_id, episode_number, title, summary, status, created_at, updated_at FROM episodes WHERE id = ?",
            (episode_id,),
        ).fetchone()
        return _episode_from_row(row)
    finally:
        connection.close()


@router.patch("/{episode_id}")
def update_episode(project_id: str, episode_id: str, payload: EpisodeUpdate):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM episodes WHERE id = ? AND project_id = ?",
            (episode_id, project_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Episode not found.")

        values = dict(row)

        for field in ("episode_number", "title", "summary", "story_id", "status"):
            value = getattr(payload, field)
            if value is not None:
                values[field] = value

        if values["episode_number"] < 1:
            raise HTTPException(status_code=400, detail="Episode number must be at least 1.")
        _validate_status(values["status"])

        if values["story_id"]:
            story = connection.execute(
                "SELECT 1 FROM stories WHERE id = ? AND project_id = ?",
                (values["story_id"], project_id),
            ).fetchone()
            if not story:
                raise HTTPException(status_code=400, detail="Story does not belong to this project.")

        now = datetime.now(timezone.utc).isoformat()

        try:
            connection.execute(
                """
                UPDATE episodes
                SET story_id = ?, episode_number = ?, title = ?, summary = ?,
                    status = ?, updated_at = ?
                WHERE id = ? AND project_id = ?
                """,
                (
                    values["story_id"], values["episode_number"], values["title"],
                    values["summary"], values["status"], now, episode_id, project_id,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Episode number already exists in this project.")
            raise

        updated = connection.execute(
            "SELECT id, project_id, story_id, episode_number, title, summary, status, created_at, updated_at FROM episodes WHERE id = ?",
            (episode_id,),
        ).fetchone()
        return _episode_from_row(updated)
    finally:
        connection.close()
