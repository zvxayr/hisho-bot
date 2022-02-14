import { Client, Intents } from 'discord.js';
import responder from './responder/index.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let prefix = '&';

const actions = {
    'Send': (message, text) => message.channel.send(text)
};

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    try {
        const full_command = message.content.slice(prefix.length);
        const context = message; // TODO: extract only useful info from message
                                 //       as the context.
        for await (const { type, payload } of responder(context, full_command)) {
            actions[type](message, payload);
        }
    } catch (error) {
        console.error(error);
        message.channel.send(error.message);
    }
});

client.login(process.env.token);
