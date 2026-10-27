from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection


router = APIRouter(prefix="/api/episodes/{episode_id}/chapters", tags=["chapters"])


class ChapterPayload(BaseModel):
    chapter_number: int
    title: str = ""
    summary: str = ""
    status: str = "draft"


class ChapterUpdate(BaseModel):
    chapter_number: int | None = None
    title: str | None = None
    summary: str | None = None
    status: str | None = None


def _validate_status(status: str) -> None:
    if status not in {"draft", "approved"}:
        raise HTTPException(status_code=400, detail="Chapter status must be draft or approved.")


def _chapter_from_row(row):
    return dict(row) if row else None


@router.get("")
def list_chapters(episode_id: str):
    connection = get_connection()
    try:
        if not connection.execute("SELECT 1 FROM episodes WHERE id = ?", (episode_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Episode not found.")
        rows = connection.execute(
            """
            SELECT id, episode_id, chapter_number, title, summary,
                   status, created_at, updated_at
            FROM chapters
            WHERE episode_id = ?
            ORDER BY chapter_number ASC
            """,
            (episode_id,),
        ).fetchall()
        return [_chapter_from_row(row) for row in rows]
    finally:
        connection.close()


@router.post("")
def create_chapter(episode_id: str, payload: ChapterPayload):
    if payload.chapter_number < 1:
        raise HTTPException(status_code=400, detail="Chapter number must be at least 1.")
    _validate_status(payload.status)

    connection = get_connection()
    try:
        if not connection.execute("SELECT 1 FROM episodes WHERE id = ?", (episode_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Episode not found.")

        now = datetime.now(timezone.utc).isoformat()
        chapter_id = str(uuid4())

        try:
            connection.execute(
                """
                INSERT INTO chapters (
                    id, episode_id, chapter_number, title, summary,
                    status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chapter_id, episode_id, payload.chapter_number, payload.title,
                    payload.summary, payload.status, now, now,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Chapter number already exists in this episode.")
            raise

        row = connection.execute(
            "SELECT id, episode_id, chapter_number, title, summary, status, created_at, updated_at FROM chapters WHERE id = ?",
            (chapter_id,),
        ).fetchone()
        return _chapter_from_row(row)
    finally:
        connection.close()


@router.patch("/{chapter_id}")
def update_chapter(episode_id: str, chapter_id: str, payload: ChapterUpdate):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM chapters WHERE id = ? AND episode_id = ?",
            (chapter_id, episode_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Chapter not found.")

        values = dict(row)

        for field in ("chapter_number", "title", "summary", "status"):
            value = getattr(payload, field)
            if value is not None:
                values[field] = value

        if values["chapter_number"] < 1:
            raise HTTPException(status_code=400, detail="Chapter number must be at least 1.")
        _validate_status(values["status"])

        now = datetime.now(timezone.utc).isoformat()

        try:
            connection.execute(
                """
                UPDATE chapters
                SET chapter_number = ?, title = ?, summary = ?, status = ?, updated_at = ?
                WHERE id = ? AND episode_id = ?
                """,
                (
                    values["chapter_number"], values["title"], values["summary"],
                    values["status"], now, chapter_id, episode_id,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Chapter number already exists in this episode.")
            raise

        updated = connection.execute(
            "SELECT id, episode_id, chapter_number, title, summary, status, created_at, updated_at FROM chapters WHERE id = ?",
            (chapter_id,),
        ).fetchone()
        return _chapter_from_row(updated)
    finally:
        connection.close()
