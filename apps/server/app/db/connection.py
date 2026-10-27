from pathlib import Path
import sqlite3

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DATABASE_PATH = PROJECT_ROOT / "storage" / "rraw.sqlite3"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection
