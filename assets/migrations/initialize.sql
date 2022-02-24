PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Guild(
    guild_id TEXT NOT NULL PRIMARY KEY,
    prefix TEXT NOT NULL,
    UNIQUE(guild_id) ON CONFLICT REPLACE
);

CREATE TABLE IF NOT EXISTS Alias(
    guild_id TEXT NOT NULL,
    alias TEXT NOT NULL,
    partial_command TEXT NOT NULL,

    CONSTRAINT fk_Guild
        FOREIGN KEY(guild_id)
        REFERENCES Guild(guild_id)
        ON DELETE CASCADE
    
    UNIQUE(guild_id, alias)
);
