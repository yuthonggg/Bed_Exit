CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_id TEXT NOT NULL,
    classification TEXT NOT NULL,
    confidence REAL NOT NULL,
    image_path TEXT,
    timestamp TEXT NOT NULL,
    acknowledged INTEGER DEFAULT 0
);
