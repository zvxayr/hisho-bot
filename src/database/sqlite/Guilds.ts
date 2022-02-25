import sqlite3 from 'sqlite3';
import { Guild, Guilds } from '..';

export default class GuildsImpl implements Guilds {
    private readonly db: sqlite3.Database;

    constructor(sqliteDatabase: sqlite3.Database) {
        this.db = sqliteDatabase;
    }

    get(guild_id: string) {
        return <Promise<Guild>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.get('SELECT * FROM Guild WHERE guild_id=?', [guild_id], (err, row) => {
                    if (err) return reject(err);
                    if (!row) return resolve({ guild_id: '', prefix: '&' });
                    return resolve(row);
                });
            });
        }));
    }

    create(guild_id: string, prefix: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('INSERT INTO Guild (guild_id, prefix) VALUES(?, ?)', [guild_id, prefix], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }

    remove(guild_id: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM Guild WHERE guild_id=?', [guild_id], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }
}
