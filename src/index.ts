import sourceMapSupport from 'source-map-support';
import { Client, Intents, Message } from 'discord.js';
import dotenv from 'dotenv';
import responder, { CommandNotFound } from './responder';
import { compose, swallow } from './utils';

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

type Transformer<Value> = (value: Value) => Value;
type Listener<Event> = (event: Event) => void;

const noBots: Transformer<Listener<Message>> = (listener) => (message) => {
    if (!message.author.bot) listener(message);
};

const usePrefix = (getPrefix: (message: Message) => string): Transformer<Listener<Message>> => (
    (listener) => (message) => {
        if (message.content.startsWith(getPrefix(message))) listener(message);
    }
);

const safeResponder = swallow(CommandNotFound)(
    ({ source, message }) => { source.channel.send(message); },
)(responder);

client.on('messageCreate', compose(noBots, usePrefix(() => '&'))(safeResponder));

client.login(process.env.token);
