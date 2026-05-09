import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'events.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Creates the database and runs schema.sql if tables don't exist."""
    with get_db_connection() as conn:
        with open(SCHEMA_PATH, 'r') as f:
            conn.executescript(f.read())
        conn.commit()

def insert_event(bed_id: str, classification: str, confidence: float, image_path: str, timestamp: str) -> int:
    """Inserts an event into the DB and returns the new row ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            INSERT INTO events (bed_id, classification, confidence, image_path, timestamp)
            VALUES (?, ?, ?, ?, ?)
            ''',
            (bed_id, classification, confidence, image_path, timestamp)
        )
        conn.commit()
        return cursor.lastrowid

def get_recent_events(limit: int = 20) -> list[dict]:
    """Returns the last N events as a list of dicts, newest first."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            SELECT * FROM events
            ORDER BY timestamp DESC
            LIMIT ?
            ''',
            (limit,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_latest_event() -> dict | None:
    """Returns the single most recent event or None."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            SELECT * FROM events
            ORDER BY timestamp DESC
            LIMIT 1
            '''
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def acknowledge_event(event_id: int) -> bool:
    """Sets acknowledged=1 for the given id. Returns True if row found."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            UPDATE events
            SET acknowledged = 1
            WHERE id = ?
            ''',
            (event_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
