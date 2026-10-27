from .connection import get_connection


CURRENT_SCHEMA_VERSION = 1


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

    if current_version < 1:
        from datetime import datetime, timezone

        _migration_1(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (1, datetime.now(timezone.utc).isoformat()),
        )

    connection.commit()
    connection.close()
