import sourceMapSupport from 'source-map-support';
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import { messageCreateHandler } from './events';
import SqliteDatabase from './database/sqlite';

sourceMapSupport.install();
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

const database = SqliteDatabase.verbose('.\\database.db');

client.on('ready', () => {
    // eslint-disable-next-line no-console
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', messageCreateHandler(database));

client.login(process.env.token);
