from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection

router = APIRouter(prefix="/api/projects/{project_id}/universe", tags=["universe"])


class UniversePayload(BaseModel):
    premise: str = ""
    genre: str = ""
    tone: str = ""
    visual_style: str = ""
    color_palette: str = ""
    atmosphere: str = ""
    world_rules: str = ""
    lore: str = ""
    timeline: str = ""


def _get_project(connection, project_id: str):
    return connection.execute(
        "SELECT id FROM projects WHERE id = ?",
        (project_id,),
    ).fetchone()


def _get_universe(connection, project_id: str):
    return connection.execute(
        """
        SELECT id, project_id, premise, genre, tone, visual_style,
               color_palette, atmosphere, world_rules, lore, timeline,
               created_at, updated_at
        FROM universes
        WHERE project_id = ?
        """,
        (project_id,),
    ).fetchone()


@router.get("")
def get_universe(project_id: str):
    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    universe = _get_universe(connection, project_id)
    connection.close()

    return dict(universe) if universe else None


@router.put("")
def save_universe(project_id: str, payload: UniversePayload):
    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    now = datetime.now(timezone.utc).isoformat()
    existing = _get_universe(connection, project_id)

    if existing:
        connection.execute(
            """
            UPDATE universes
            SET premise = ?, genre = ?, tone = ?, visual_style = ?,
                color_palette = ?, atmosphere = ?, world_rules = ?,
                lore = ?, timeline = ?, updated_at = ?
            WHERE project_id = ?
            """,
            (
                payload.premise.strip(),
                payload.genre.strip(),
                payload.tone.strip(),
                payload.visual_style.strip(),
                payload.color_palette.strip(),
                payload.atmosphere.strip(),
                payload.world_rules.strip(),
                payload.lore.strip(),
                payload.timeline.strip(),
                now,
                project_id,
            ),
        )
    else:
        connection.execute(
            """
            INSERT INTO universes (
                id, project_id, premise, genre, tone, visual_style,
                color_palette, atmosphere, world_rules, lore, timeline,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid4()),
                project_id,
                payload.premise.strip(),
                payload.genre.strip(),
                payload.tone.strip(),
                payload.visual_style.strip(),
                payload.color_palette.strip(),
                payload.atmosphere.strip(),
                payload.world_rules.strip(),
                payload.lore.strip(),
                payload.timeline.strip(),
                now,
                now,
            ),
        )

    connection.commit()
    universe = _get_universe(connection, project_id)
    connection.close()

    return dict(universe)
