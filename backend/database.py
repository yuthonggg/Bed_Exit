import sqlite3
import os
import json

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
        _ensure_column(conn, 'events', 'sensor_data', 'TEXT')
        conn.commit()

def _ensure_column(conn: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    cursor = conn.cursor()
    cursor.execute(f'PRAGMA table_info({table})')
    existing_columns = {row['name'] for row in cursor.fetchall()}
    if column not in existing_columns:
        cursor.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')

def insert_event(
    bed_id: str,
    classification: str,
    confidence: float,
    image_path: str,
    timestamp: str,
    sensor_data: dict | None = None,
) -> int:
    """Inserts an event into the DB and returns the new row ID."""
    sensor_data_json = sensor_data if isinstance(sensor_data, str) else json.dumps(sensor_data) if sensor_data else None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            INSERT INTO events (bed_id, classification, confidence, image_path, sensor_data, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (bed_id, classification, confidence, image_path, sensor_data_json, timestamp)
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

def insert_sensor_reading(
    bed_id: str,
    x: float,
    y: float,
    risk: float | None,
    z_score: float | None,
    status: str,
    timestamp: str,
) -> int:
    """Inserts one sensor reading and returns the new row ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''
            INSERT INTO sensor_readings (bed_id, x, y, risk, z_score, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            (bed_id, x, y, risk, z_score, status, timestamp)
        )
        conn.commit()
        return cursor.lastrowid

def get_recent_sensor_readings(bed_id: str | None = None, limit: int = 120) -> list[dict]:
    """Returns recent sensor readings, oldest first for chart rendering."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if bed_id:
            cursor.execute(
                '''
                SELECT * FROM (
                    SELECT * FROM sensor_readings
                    WHERE bed_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                )
                ORDER BY timestamp ASC
                ''',
                (bed_id, limit)
            )
        else:
            cursor.execute(
                '''
                SELECT * FROM (
                    SELECT * FROM sensor_readings
                    ORDER BY timestamp DESC
                    LIMIT ?
                )
                ORDER BY timestamp ASC
                ''',
                (limit,)
            )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
