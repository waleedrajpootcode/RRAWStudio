from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db.connection import get_connection

router = APIRouter(
    prefix="/api/projects/{project_id}/characters",
    tags=["characters"],
)


class CharacterPayload(BaseModel):
    name: str
    role: str = ""
    age: str = ""
    personality: str = ""
    appearance: str = ""
    hair: str = ""
    eyes: str = ""
    skin: str = ""
    body: str = ""
    clothing: str = ""
    colors: str = ""
    visual_style: str = ""
    voice: str = ""
    relationships: str = ""
    character_arc: str = ""
    facts: str = ""


class CharacterUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    age: str | None = None
    personality: str | None = None
    appearance: str | None = None
    hair: str | None = None
    eyes: str | None = None
    skin: str | None = None
    body: str | None = None
    clothing: str | None = None
    colors: str | None = None
    visual_style: str | None = None
    voice: str | None = None
    relationships: str | None = None
    character_arc: str | None = None
    facts: str | None = None


def _get_project(connection, project_id: str):
    return connection.execute(
        "SELECT id FROM projects WHERE id = ?",
        (project_id,),
    ).fetchone()


def _get_character(connection, project_id: str, character_id: str):
    return connection.execute(
        """
        SELECT id, project_id, name, role, age, personality, appearance,
               hair, eyes, skin, body, clothing, colors, visual_style,
               voice, relationships, character_arc, facts,
               created_at, updated_at
        FROM characters
        WHERE id = ? AND project_id = ?
        """,
        (character_id, project_id),
    ).fetchone()


@router.get("")
def list_characters(project_id: str):
    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    characters = connection.execute(
        """
        SELECT id, project_id, name, role, age, personality, appearance,
               hair, eyes, skin, body, clothing, colors, visual_style,
               voice, relationships, character_arc, facts,
               created_at, updated_at
        FROM characters
        WHERE project_id = ?
        ORDER BY created_at DESC
        """,
        (project_id,),
    ).fetchall()

    connection.close()

    return [dict(character) for character in characters]


@router.get("/{character_id}")
def get_character(project_id: str, character_id: str):
    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    character = _get_character(connection, project_id, character_id)
    connection.close()

    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")

    return dict(character)


@router.post("", status_code=201)
def create_character(project_id: str, payload: CharacterPayload):
    name = payload.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Character name is required.")

    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    character_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    connection.execute(
        """
        INSERT INTO characters (
            id, project_id, name, role, age, personality, appearance,
            hair, eyes, skin, body, clothing, colors, visual_style,
            voice, relationships, character_arc, facts,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            character_id,
            project_id,
            name,
            payload.role.strip(),
            payload.age.strip(),
            payload.personality.strip(),
            payload.appearance.strip(),
            payload.hair.strip(),
            payload.eyes.strip(),
            payload.skin.strip(),
            payload.body.strip(),
            payload.clothing.strip(),
            payload.colors.strip(),
            payload.visual_style.strip(),
            payload.voice.strip(),
            payload.relationships.strip(),
            payload.character_arc.strip(),
            payload.facts.strip(),
            now,
            now,
        ),
    )
    connection.commit()

    character = _get_character(connection, project_id, character_id)
    connection.close()

    return dict(character)


@router.patch("/{character_id}")
def update_character(
    project_id: str,
    character_id: str,
    payload: CharacterUpdate,
):
    if payload.name is not None and not payload.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Character name cannot be empty.",
        )

    updates = []
    values = []

    for field in (
        "name",
        "role",
        "age",
        "personality",
        "appearance",
        "hair",
        "eyes",
        "skin",
        "body",
        "clothing",
        "colors",
        "visual_style",
        "voice",
        "relationships",
        "character_arc",
        "facts",
    ):
        value = getattr(payload, field)
        if value is not None:
            updates.append(f"{field} = ?")
            values.append(value.strip())

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No character changes supplied.",
        )

    updates.append("updated_at = ?")
    values.append(datetime.now(timezone.utc).isoformat())
    values.extend([character_id, project_id])

    connection = get_connection()

    if _get_project(connection, project_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    if _get_character(connection, project_id, character_id) is None:
        connection.close()
        raise HTTPException(status_code=404, detail="Character not found.")

    connection.execute(
        f"""
        UPDATE characters
        SET {", ".join(updates)}
        WHERE id = ? AND project_id = ?
        """,
        values,
    )
    connection.commit()

    character = _get_character(connection, project_id, character_id)
    connection.close()

    return dict(character)
