import sqlite3 from 'sqlite3';
import { Aliases } from '..';

export default class AliasesImpl implements Aliases {
    private readonly db: sqlite3.Database;

    constructor(sqliteDatabase: sqlite3.Database) {
        this.db = sqliteDatabase;
    }

    async unalias(guild_id: string, alias: string) {
        return <Promise<string>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.get('SELECT partial_command FROM Alias WHERE guild_id=? AND alias=?', [guild_id, alias], (err, row) => {
                    if (err) return reject(err);
                    return resolve(row?.partial_command);
                });
            });
        }));
    }

    async create(guild_id: string, partial_command: string, alias: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('INSERT INTO Alias (guild_id, partial_command, alias) VALUES(?, ?, ?)', [guild_id, partial_command, alias], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }

    async remove(guild_id: string, alias: string) {
        return <Promise<void>>(new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM Alias WHERE guild_id=? AND alias=?', [guild_id, alias], (err) => {
                    if (err) return reject(err);
                    return resolve();
                });
            });
        }));
    }
}
