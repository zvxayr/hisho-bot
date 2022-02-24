PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Guild(
    guild_id TEXT NOT NULL PRIMARY KEY,
    prefix TEXT NOT NULL,
    UNIQUE(guild_id) ON CONFLICT REPLACE
);
