import sourceMapSupport from 'source-map-support';
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import { messageCreateResponder } from './events';

sourceMapSupport.install();
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

client.on('ready', () => {
    // eslint-disable-next-line no-console
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', messageCreateResponder);

client.login(process.env.token);
