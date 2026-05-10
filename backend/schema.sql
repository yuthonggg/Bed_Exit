CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_id TEXT NOT NULL,
    classification TEXT NOT NULL,
    confidence REAL NOT NULL,
    image_path TEXT,
    sensor_data TEXT,
    timestamp TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_id TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    risk REAL,
    z_score REAL,
    status TEXT,
    timestamp TEXT NOT NULL
);
