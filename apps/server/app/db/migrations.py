from .connection import get_connection


CURRENT_SCHEMA_VERSION = 2


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

    connection.commit()
    connection.close()
