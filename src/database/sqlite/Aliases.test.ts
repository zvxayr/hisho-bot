import sqlite3 from 'sqlite3';
import AliasesImpl from './Aliases';

describe('test Aliases API', () => {
    describe('using an empty database', () => {
        const sqliteDatabase = new sqlite3.Database(':memory:');
        const Aliases = new AliasesImpl(sqliteDatabase);

        afterAll(() => sqliteDatabase.close());

        it('should return an error on unalias', async () => {
            await expect(Aliases.unalias('1', 'h')).rejects.toBeDefined();
        });

        it('should return an error on create', async () => {
            await expect(Aliases.create('1', 'help', 'h')).rejects.toBeDefined();
        });

        it('should return an error on remove', async () => {
            await expect(Aliases.remove('1', 'h')).rejects.toBeDefined();
        });
    });

    describe('using a valid database', () => {
        const sqliteDatabase = new sqlite3.Database(':memory:');
        const Aliases = new AliasesImpl(sqliteDatabase);

        beforeAll(() => new Promise((res) => {
            sqliteDatabase.exec(`
                CREATE TABLE IF NOT EXISTS Guild(
                    guild_id TEXT NOT NULL PRIMARY KEY,
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
            `, res);
        }));

        afterAll(() => sqliteDatabase.close());

        it('should succeed on create', async () => {
            expect(await Aliases.create('1', 'help', 'h')).toBeUndefined();
        });

        it('should get created alias', async () => {
            expect(await Aliases.unalias('1', 'h')).toBe('help');
        });

        it('should return undefined if alias is not found', async () => {
            expect(await Aliases.unalias('1', 'p')).toBeUndefined();
        });

        it('should remove alias', async () => {
            expect(await Aliases.remove('1', 'h')).toBeUndefined();
            expect(await Aliases.unalias('1', 'h')).toBeUndefined();
        });

        it('should silently fail when removing non-existent data', async () => {
            await expect(Aliases.remove('2', 'xxx')).resolves.toBeUndefined();
        });
    });
});
