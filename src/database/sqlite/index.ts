/* eslint-disable max-classes-per-file */
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import Database, { Aliases, Guilds } from '..';
import GuildsImpl from './Guilds';
import AliasesImpl from './Aliases';

const doNothing = () => { };

export default class SqliteDatabase implements Database {
    private readonly db: sqlite3.Database;

    readonly Guilds: Guilds;

    readonly Aliases: Aliases;

    constructor(sqliteDatabase: sqlite3.Database) {
        this.db = sqliteDatabase;
        this.Guilds = new GuildsImpl(this.db);
        this.Aliases = new AliasesImpl(this.db);
        this.initialize();
    }

    static verbose(filename: string, callback = doNothing) {
        return new this(new (sqlite3.verbose()).Database(filename, callback));
    }

    private initialize() {
        const initializeSQLFile = path.resolve('./assets/migrations/initialize.sql');
        const initializeSQLcommand = fs.readFileSync(initializeSQLFile).toString();
        this.db.exec(initializeSQLcommand);
    }
}
