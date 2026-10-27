from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection


router = APIRouter(prefix="/api/scenes/{scene_id}/shots", tags=["shots"])


SHOT_FIELDS = (
    "shot_number",
    "title",
    "duration",
    "camera",
    "composition",
    "characters",
    "poses",
    "emotion",
    "dialogue",
    "background",
    "midground",
    "foreground",
    "effects",
    "lighting",
    "motion",
    "transition",
    "music",
    "sfx",
    "render_settings",
    "status",
)


class ShotPayload(BaseModel):
    shot_number: int
    title: str = ""
    duration: float = 0
    camera: str = ""
    composition: str = ""
    characters: str = ""
    poses: str = ""
    emotion: str = ""
    dialogue: str = ""
    background: str = ""
    midground: str = ""
    foreground: str = ""
    effects: str = ""
    lighting: str = ""
    motion: str = ""
    transition: str = ""
    music: str = ""
    sfx: str = ""
    render_settings: str = ""
    status: str = "draft"


class ShotUpdate(BaseModel):
    shot_number: int | None = None
    title: str | None = None
    duration: float | None = None
    camera: str | None = None
    composition: str | None = None
    characters: str | None = None
    poses: str | None = None
    emotion: str | None = None
    dialogue: str | None = None
    background: str | None = None
    midground: str | None = None
    foreground: str | None = None
    effects: str | None = None
    lighting: str | None = None
    motion: str | None = None
    transition: str | None = None
    music: str | None = None
    sfx: str | None = None
    render_settings: str | None = None
    status: str | None = None


def _validate_shot(payload_number: int, duration: float, status: str) -> None:
    if payload_number < 1:
        raise HTTPException(status_code=400, detail="Shot number must be at least 1.")
    if duration < 0:
        raise HTTPException(status_code=400, detail="Shot duration cannot be negative.")
    if status not in {"draft", "approved"}:
        raise HTTPException(status_code=400, detail="Shot status must be draft or approved.")


def _scene_exists(connection, scene_id: str) -> bool:
    return connection.execute(
        "SELECT 1 FROM scenes WHERE id = ?", (scene_id,)
    ).fetchone() is not None


def _shot_from_row(row):
    return dict(row) if row else None


@router.get("")
def list_shots(scene_id: str):
    connection = get_connection()
    try:
        if not _scene_exists(connection, scene_id):
            raise HTTPException(status_code=404, detail="Scene not found.")

        rows = connection.execute(
            """
            SELECT id, scene_id, shot_number, title, duration, camera,
                   composition, characters, poses, emotion, dialogue,
                   background, midground, foreground, effects, lighting,
                   motion, transition, music, sfx, render_settings,
                   status, created_at, updated_at
            FROM shots
            WHERE scene_id = ?
            ORDER BY shot_number ASC
            """,
            (scene_id,),
        ).fetchall()
        return [_shot_from_row(row) for row in rows]
    finally:
        connection.close()


@router.post("")
def create_shot(scene_id: str, payload: ShotPayload):
    _validate_shot(payload.shot_number, payload.duration, payload.status)

    connection = get_connection()
    try:
        if not _scene_exists(connection, scene_id):
            raise HTTPException(status_code=404, detail="Scene not found.")

        now = datetime.now(timezone.utc).isoformat()
        shot_id = str(uuid4())

        try:
            connection.execute(
                """
                INSERT INTO shots (
                    id, scene_id, shot_number, title, duration, camera,
                    composition, characters, poses, emotion, dialogue,
                    background, midground, foreground, effects, lighting,
                    motion, transition, music, sfx, render_settings,
                    status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    shot_id, scene_id, payload.shot_number, payload.title,
                    payload.duration, payload.camera, payload.composition,
                    payload.characters, payload.poses, payload.emotion,
                    payload.dialogue, payload.background, payload.midground,
                    payload.foreground, payload.effects, payload.lighting,
                    payload.motion, payload.transition, payload.music,
                    payload.sfx, payload.render_settings, payload.status,
                    now, now,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(
                    status_code=409,
                    detail="Shot number already exists in this scene.",
                )
            raise

        row = connection.execute(
            """
            SELECT id, scene_id, shot_number, title, duration, camera,
                   composition, characters, poses, emotion, dialogue,
                   background, midground, foreground, effects, lighting,
                   motion, transition, music, sfx, render_settings,
                   status, created_at, updated_at
            FROM shots WHERE id = ?
            """,
            (shot_id,),
        ).fetchone()
        return _shot_from_row(row)
    finally:
        connection.close()


@router.patch("/{shot_id}")
def update_shot(scene_id: str, shot_id: str, payload: ShotUpdate):
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT * FROM shots WHERE id = ? AND scene_id = ?",
            (shot_id, scene_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Shot not found.")

        values = dict(row)

        for field in SHOT_FIELDS:
            value = getattr(payload, field)
            if value is not None:
                values[field] = value

        _validate_shot(
            values["shot_number"],
            values["duration"],
            values["status"],
        )

        now = datetime.now(timezone.utc).isoformat()

        try:
            connection.execute(
                """
                UPDATE shots
                SET shot_number = ?, title = ?, duration = ?, camera = ?,
                    composition = ?, characters = ?, poses = ?, emotion = ?,
                    dialogue = ?, background = ?, midground = ?, foreground = ?,
                    effects = ?, lighting = ?, motion = ?, transition = ?,
                    music = ?, sfx = ?, render_settings = ?, status = ?,
                    updated_at = ?
                WHERE id = ? AND scene_id = ?
                """,
                (
                    values["shot_number"], values["title"], values["duration"],
                    values["camera"], values["composition"], values["characters"],
                    values["poses"], values["emotion"], values["dialogue"],
                    values["background"], values["midground"], values["foreground"],
                    values["effects"], values["lighting"], values["motion"],
                    values["transition"], values["music"], values["sfx"],
                    values["render_settings"], values["status"], now,
                    shot_id, scene_id,
                ),
            )
            connection.commit()
        except Exception as exc:
            connection.rollback()
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(
                    status_code=409,
                    detail="Shot number already exists in this scene.",
                )
            raise

        updated = connection.execute(
            """
            SELECT id, scene_id, shot_number, title, duration, camera,
                   composition, characters, poses, emotion, dialogue,
                   background, midground, foreground, effects, lighting,
                   motion, transition, music, sfx, render_settings,
                   status, created_at, updated_at
            FROM shots WHERE id = ?
            """,
            (shot_id,),
        ).fetchone()
        return _shot_from_row(updated)
    finally:
        connection.close()
