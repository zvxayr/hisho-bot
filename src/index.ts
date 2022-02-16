import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { Client, Intents, Message } from 'discord.js';
import responder, { Context } from './responder';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let prefix = '&';

interface ActionConsumer {
    [key: string]: (message : Message, text : string ) => void
}

const actionConsumer : ActionConsumer = {
    'Send': (message, text) => { message.channel.send(text); }
};

const getContext = (message : Message) : Context => {
    return {
        sender: {
            id: message.author.id,
            name: message.author.username,
        }
    }
}

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    try {
        const full_command = message.content.slice(prefix.length);
        const context = getContext(message);
        for await (const { type, payload } of responder(context, full_command)) {
            actionConsumer[type](message, payload);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);
            message.channel.send(error.message);
        }
    }
});

client.login(process.env.token);
