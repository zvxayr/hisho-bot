PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Guild;
CREATE TABLE IF NOT EXISTS Guild(
    id TEXT NOT NULL,
    prefix TEXT,
    UNIQUE(id) ON CONFLICT REPLACE
);
