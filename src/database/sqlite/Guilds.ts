import sqlite3 from 'sqlite3';
import { Guild, Guilds } from '..';

export default class GuildsImpl implements Guilds {
    private readonly db: sqlite3.Database;

    constructor(sqliteDatabase: sqlite3.Database) {
        this.db = sqliteDatabase;
    }

    async get(id: string) {
        return <Promise<Guild>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.get('SELECT * FROM Guild WHERE id=?', [id], (err, row) => {
                    if (err) return reject(err);
                    if (!row) return resolve({ id: '', prefix: '&' });
                    return resolve(row);
                });
            });
        }));
    }

    async create(id: string, prefix: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('INSERT INTO Guild (id, prefix) VALUES(?, ?)', [id, prefix], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }

    async remove(id: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM Guild WHERE id=?', [id], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }
}
