from .connection import get_connection


CURRENT_SCHEMA_VERSION = 6


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


def _migration_4(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL UNIQUE,
            concept TEXT NOT NULL DEFAULT '',
            logline TEXT NOT NULL DEFAULT '',
            theme TEXT NOT NULL DEFAULT '',
            summary TEXT NOT NULL DEFAULT '',
            genre TEXT NOT NULL DEFAULT '',
            tone TEXT NOT NULL DEFAULT '',
            narrative_direction TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'approved')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
        """
    )



def _migration_5(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS episodes (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            story_id TEXT,
            episode_number INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            summary TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'approved')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (project_id, episode_number),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE SET NULL
        )
        """
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            episode_id TEXT NOT NULL,
            chapter_number INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            summary TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'approved')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (episode_id, chapter_number),
            FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
        )
        """
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS scenes (
            id TEXT PRIMARY KEY,
            chapter_id TEXT NOT NULL,
            scene_number INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            location TEXT NOT NULL DEFAULT '',
            time_of_day TEXT NOT NULL DEFAULT '',
            characters TEXT NOT NULL DEFAULT '',
            actions TEXT NOT NULL DEFAULT '',
            dialogue TEXT NOT NULL DEFAULT '',
            emotion TEXT NOT NULL DEFAULT '',
            lighting TEXT NOT NULL DEFAULT '',
            atmosphere TEXT NOT NULL DEFAULT '',
            camera_audio_intent TEXT NOT NULL DEFAULT '',
            continuity TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'approved')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (chapter_id, scene_number),
            FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        )
        """
    )





def _migration_6(connection) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS shots (
            id TEXT PRIMARY KEY,
            scene_id TEXT NOT NULL,
            shot_number INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            duration REAL NOT NULL DEFAULT 0,
            camera TEXT NOT NULL DEFAULT '',
            composition TEXT NOT NULL DEFAULT '',
            characters TEXT NOT NULL DEFAULT '',
            poses TEXT NOT NULL DEFAULT '',
            emotion TEXT NOT NULL DEFAULT '',
            dialogue TEXT NOT NULL DEFAULT '',
            background TEXT NOT NULL DEFAULT '',
            midground TEXT NOT NULL DEFAULT '',
            foreground TEXT NOT NULL DEFAULT '',
            effects TEXT NOT NULL DEFAULT '',
            lighting TEXT NOT NULL DEFAULT '',
            motion TEXT NOT NULL DEFAULT '',
            transition TEXT NOT NULL DEFAULT '',
            music TEXT NOT NULL DEFAULT '',
            sfx TEXT NOT NULL DEFAULT '',
            render_settings TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'approved')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (scene_id, shot_number),
            FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
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

        current_version = 3

    if current_version < 4:
        _migration_4(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (4, datetime.now(timezone.utc).isoformat()),
        )
        current_version = 4

    if current_version < 5:
        _migration_5(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (5, datetime.now(timezone.utc).isoformat()),
        )
        current_version = 5

    if current_version < 6:
        _migration_6(connection)
        connection.execute(
            "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
            (6, datetime.now(timezone.utc).isoformat()),
        )
        current_version = 6

    connection.commit()
    connection.close()
