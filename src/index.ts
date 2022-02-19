import sourceMapSupport from 'source-map-support';
import { Client, Intents, Message } from 'discord.js';
import dotenv from 'dotenv';
import responder, { Context } from './responder';

sourceMapSupport.install();
dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const prefix = '&';

const getContext = (message: Message): Context => ({
    sender: {
        id: message.author.id,
        name: message.author.username,
    },
});

client.on('ready', () => {
    // eslint-disable-next-line no-console
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    try {
        const fullCommand = message.content.slice(prefix.length);
        const context = getContext(message);
        for await (const action of responder(context, fullCommand)) {
            action(message);
        }
    } catch (error) {
        if (error instanceof Error) {
            message.channel.send(error.message);
        }
    }
});

client.login(process.env.token);
