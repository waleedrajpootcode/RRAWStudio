from .connection import get_connection


CURRENT_SCHEMA_VERSION = 3


def _migration_1(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'archived')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )


def _migration_2(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS universes (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            premise TEXT NOT NULL DEFAULT '',
            genre TEXT NOT NULL DEFAULT '',
            tone TEXT NOT NULL DEFAULT '',
            visual_style TEXT NOT NULL DEFAULT '',
            color_palette TEXT NOT NULL DEFAULT '',
            atmosphere TEXT NOT NULL DEFAULT '',
            world_rules TEXT NOT NULL DEFAULT '',
            lore TEXT NOT NULL DEFAULT '',
            timeline TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
        """
    )


def _migration_3(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT '',
            age TEXT NOT NULL DEFAULT '',
            personality TEXT NOT NULL DEFAULT '',
            appearance TEXT NOT NULL DEFAULT '',
            hair TEXT NOT NULL DEFAULT '',
            eyes TEXT NOT NULL DEFAULT '',
            skin TEXT NOT NULL DEFAULT '',
            body TEXT NOT NULL DEFAULT '',
            clothing TEXT NOT NULL DEFAULT '',
            colors TEXT NOT NULL DEFAULT '',
            visual_style TEXT NOT NULL DEFAULT '',
            voice TEXT NOT NULL DEFAULT '',
            relationships TEXT NOT NULL DEFAULT '',
            character_arc TEXT NOT NULL DEFAULT '',
            facts TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
        """
    )


def initialize_database() -> None:
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        )
        """
    )

    current_version = connection.execute(
        "SELECT COALESCE(MAX(version), 0) FROM schema_version"
    ).fetchone()[0]

    from datetime import datetime, timezone

    if current_version < 1:
        _migration_1(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (1, datetime.now(timezone.utc).isoformat()),
        )
        current_version = 1

    if current_version < 2:
        _migration_2(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (2, datetime.now(timezone.utc).isoformat()),
        )
        current_version = 2

    if current_version < 3:
        _migration_3(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (3, datetime.now(timezone.utc).isoformat()),
        )

    connection.commit()
    connection.close()
