from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection


router = APIRouter(prefix="/api/projects/{project_id}/story", tags=["story"])


class StoryPayload(BaseModel):
    concept: str = ""
    logline: str = ""
    theme: str = ""
    summary: str = ""
    genre: str = ""
    tone: str = ""
    narrative_direction: str = ""
    status: str = "draft"


def _validate_status(status: str) -> None:
    if status not in {"draft", "approved"}:
        raise HTTPException(
            status_code=400,
            detail="Story status must be draft or approved.",
        )


def _project_exists(connection, project_id: str) -> bool:
    row = connection.execute(
        "SELECT 1 FROM projects WHERE id = ?",
        (project_id,),
    ).fetchone()
    return row is not None


def _story_from_row(row):
    if row is None:
        return None

    return dict(row)


@router.get("")
def get_story(project_id: str):
    connection = get_connection()

    try:
        if not _project_exists(connection, project_id):
            raise HTTPException(status_code=404, detail="Project not found.")

        row = connection.execute(
            """
            SELECT
                id,
                project_id,
                concept,
                logline,
                theme,
                summary,
                genre,
                tone,
                narrative_direction,
                status,
                created_at,
                updated_at
            FROM stories
            WHERE project_id = ?
            """,
            (project_id,),
        ).fetchone()

        return _story_from_row(row)
    finally:
        connection.close()


@router.put("")
def save_story(project_id: str, payload: StoryPayload):
    _validate_status(payload.status)

    connection = get_connection()

    try:
        if not _project_exists(connection, project_id):
            raise HTTPException(status_code=404, detail="Project not found.")

        now = datetime.now(timezone.utc).isoformat()

        existing = connection.execute(
            "SELECT id, created_at FROM stories WHERE project_id = ?",
            (project_id,),
        ).fetchone()

        if existing:
            connection.execute(
                """
                UPDATE stories
                SET
                    concept = ?,
                    logline = ?,
                    theme = ?,
                    summary = ?,
                    genre = ?,
                    tone = ?,
                    narrative_direction = ?,
                    status = ?,
                    updated_at = ?
                WHERE project_id = ?
                """,
                (
                    payload.concept,
                    payload.logline,
                    payload.theme,
                    payload.summary,
                    payload.genre,
                    payload.tone,
                    payload.narrative_direction,
                    payload.status,
                    now,
                    project_id,
                ),
            )
            story_id = existing["id"]
        else:
            story_id = str(uuid4())

            connection.execute(
                """
                INSERT INTO stories (
                    id,
                    project_id,
                    concept,
                    logline,
                    theme,
                    summary,
                    genre,
                    tone,
                    narrative_direction,
                    status,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    story_id,
                    project_id,
                    payload.concept,
                    payload.logline,
                    payload.theme,
                    payload.summary,
                    payload.genre,
                    payload.tone,
                    payload.narrative_direction,
                    payload.status,
                    now,
                    now,
                ),
            )

        connection.commit()

        row = connection.execute(
            """
            SELECT
                id,
                project_id,
                concept,
                logline,
                theme,
                summary,
                genre,
                tone,
                narrative_direction,
                status,
                created_at,
                updated_at
            FROM stories
            WHERE id = ?
            """,
            (story_id,),
        ).fetchone()

        return _story_from_row(row)
    finally:
        connection.close()
