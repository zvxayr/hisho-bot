import sourceMapSupport from 'source-map-support';
import { Client, Intents, Message } from 'discord.js';
import dotenv from 'dotenv';
import responder from './responder';
import { compose, Transformer } from './utils';

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

type Listener<Event> = (event: Event) => void | Promise<void>;

const noBots: Transformer<Listener<Message>> = (listener) => (message) => {
    if (!message.author.bot) listener(message);
};

const usePrefix = (getPrefix: (message: Message) => string): Transformer<Listener<Message>> => (
    (listener) => (message) => {
        if (message.content.startsWith(getPrefix(message))) listener(message);
    }
);

client.on('messageCreate', compose(
    noBots,
    usePrefix(() => '&'),
)(async (message) => {
    try {
        await responder(message);
    } catch (error) {
        if (error instanceof Error) {
            message.channel.send(error.message);
        }
    }
}));

client.login(process.env.token);
