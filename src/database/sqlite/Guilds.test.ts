import sqlite3 from 'sqlite3';
import GuildsImpl from './Guilds';

describe('test Guilds API', () => {
    describe('using an empty database', () => {
        const sqliteDatabase = new sqlite3.Database(':memory:');
        const Guilds = new GuildsImpl(sqliteDatabase);

        afterAll(() => sqliteDatabase.close());

        it('should return an error on create', async () => {
            expect(Guilds.create('1', '&')).rejects.toBeDefined();
        });

        it('should return an error on get', () => {
            expect(Guilds.get('1')).rejects.toBeDefined();
        });

        it('should return an error on remove', () => {
            expect(Guilds.remove('1')).rejects.toBeDefined();
        });
    });

    describe('using a valid database', () => {
        const sqliteDatabase = new sqlite3.Database(':memory:');
        const Guilds = new GuildsImpl(sqliteDatabase);

        beforeAll(() => new Promise((res) => {
            sqliteDatabase.exec(`
                DROP TABLE IF EXISTS Guild;
                CREATE TABLE Guild(
                    guild_id TEXT NOT NULL,
                    prefix TEXT,
                    UNIQUE(guild_id) ON CONFLICT REPLACE
                );
            `, res);
        }));

        afterAll(() => sqliteDatabase.close());

        it('should succeed on create', async () => {
            expect(await Guilds.create('1', '&')).toBeUndefined();
        });

        it('should succeed on getting existing guilds', async () => {
            expect(await Guilds.get('1')).toEqual({ guild_id: '1', prefix: '&' });
        });

        it('should return null object on getting non-existent guilds', async () => {
            expect(await Guilds.get('2')).toHaveProperty('guild_id', '');
        });

        it('should modify existing guild', async () => {
            expect(await Guilds.create('1', '^')).toBeUndefined();
            expect(await Guilds.get('1')).toEqual({ guild_id: '1', prefix: '^' });
        });

        it('should remove existing guild', async () => {
            expect(await Guilds.remove('1')).toBeUndefined();
            expect(await Guilds.get('1')).toHaveProperty('guild_id', '');
        });

        it('should sliently fail when removing nothing', async () => {
            expect(await Guilds.remove('1')).toBeUndefined();
        });
    });
});
