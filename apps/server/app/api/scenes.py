from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection


router = APIRouter(prefix="/api/chapters/{chapter_id}/scenes", tags=["scenes"])


class ScenePayload(BaseModel):
    scene_number: int
    title: str = ""
    location: str = ""
    time_of_day: str = ""
    characters: str = ""
    actions: str = ""
    dialogue: str = ""
    emotion: str = ""
    lighting: str = ""
    atmosphere: str = ""
    camera_audio_intent: str = ""
    continuity: str = ""
    status: str = "draft"


class SceneUpdate(BaseModel):
    scene_number: int | None = None
    title: str | None = None
    location: str | None = None
    time_of_day: str | None = None
    characters: str | None = None
    actions: str | None = None
    dialogue: str | None = None
    emotion: str | None = None
    lighting: str | None = None
    atmosphere: str | None = None
    camera_audio_intent: str | None = None
    continuity: str | None = None
    status: str | None = None


SCENE_FIELDS = (
    "scene_number", "title", "location", "time_of_day", "characters",
    "actions", "dialogue", "emotion", "lighting", "atmosphere",
    "camera_audio_intent", "continuity", "status",
)


def _validate_status(status: str) -> None:
    if status not in {"draft", "approved"}:
        raise HTTPException(status_code=400, detail="Scene status must be draft or approved.")


def _scene_from_row(row):
    return dict(row) if row else None


@router.get("")
def list_scenes(chapter_id: str):
    connection = get_connection()
    try:
        if not connection.execute("SELECT 1 FROM chapters WHERE id = ?", (chapter_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Chapter not found.")
        rows = connection.execute(
            """
            SELECT id, chapter_id, scene_number, title, location, time_of_day,
                   characters, actions, dialogue, emotion, lighting, atmosphere,
                   camera_audio_intent, continuity, status, created_at, updated_at
            FROM scenes
            WHERE chapter_id = ?
            ORDER BY scene_number ASC
            """,
            (chapter_id,),
        ).fetchall()
        return [_scene_from_row(row) for row in rows]
    finally:
        connection.close()


@router.post("")
def create_scene(chapter_id: str, payload: ScenePayload):
    if payload.scene_number < 1:
        raise HTTPException(status_code=400, detail="Scene number must be at least 1.")
    _validate_status(payload.status)

    connection = get_connection()
    try:
        if not connection.execute("SELECT 1 FROM chapters WHERE id = ?", (chapter_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Chapter not found.")

        now = datetime.now(timezone.utc).isoformat()
        scene_id = str(uuid4())

        try:
            connection.execute(
                """
                INSERT INTO scenes (
                    id, chapter_id, scene_number, title, location, time_of_day,
                    characters, actions, dialogue, emotion, lighting, atmosphere,
                    camera_audio_intent, continuity, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    scene_id, chapter_id, payload.scene_number, payload.title,
                    payload.location, payload.time_of_day, payload.characters,
                    payload.actions, payload.dialogue, payload.emotion,
                    payload.lighting, payload.atmosphere, payload.camera_audio_intent,
                    payload.continuity, payload.status, now, now,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Scene number already exists in this chapter.")
            raise

        row = connection.execute(
            """
            SELECT id, chapter_id, scene_number, title, location, time_of_day,
                   characters, actions, dialogue, emotion, lighting, atmosphere,
                   camera_audio_intent, continuity, status, created_at, updated_at
            FROM scenes WHERE id = ?
            """,
            (scene_id,),
        ).fetchone()
        return _scene_from_row(row)
    finally:
        connection.close()


@router.patch("/{scene_id}")
def update_scene(chapter_id: str, scene_id: str, payload: SceneUpdate):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM scenes WHERE id = ? AND chapter_id = ?",
            (scene_id, chapter_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Scene not found.")

        values = dict(row)

        for field in SCENE_FIELDS:
            value = getattr(payload, field)
            if value is not None:
                values[field] = value

        if values["scene_number"] < 1:
            raise HTTPException(status_code=400, detail="Scene number must be at least 1.")
        _validate_status(values["status"])

        now = datetime.now(timezone.utc).isoformat()

        try:
            connection.execute(
                """
                UPDATE scenes
                SET scene_number = ?, title = ?, location = ?, time_of_day = ?,
                    characters = ?, actions = ?, dialogue = ?, emotion = ?,
                    lighting = ?, atmosphere = ?, camera_audio_intent = ?,
                    continuity = ?, status = ?, updated_at = ?
                WHERE id = ? AND chapter_id = ?
                """,
                (
                    values["scene_number"], values["title"], values["location"],
                    values["time_of_day"], values["characters"], values["actions"],
                    values["dialogue"], values["emotion"], values["lighting"],
                    values["atmosphere"], values["camera_audio_intent"],
                    values["continuity"], values["status"], now, scene_id, chapter_id,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(status_code=409, detail="Scene number already exists in this chapter.")
            raise

        updated = connection.execute(
            """
            SELECT id, chapter_id, scene_number, title, location, time_of_day,
                   characters, actions, dialogue, emotion, lighting, atmosphere,
                   camera_audio_intent, continuity, status, created_at, updated_at
            FROM scenes WHERE id = ?
            """,
            (scene_id,),
        ).fetchone()
        return _scene_from_row(updated)
    finally:
        connection.close()
