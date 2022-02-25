import { Message } from 'discord.js';
import Database from '../database';

type Transformer<Value> = (value: Value) => Value;
type Consumer<Args extends any[]> = (...args: Args) => Promise<void>;

export const noBots: Transformer<Consumer<[Database, Message]>> = (
    (listener) => async (db, message) => {
        if (!message.author.bot) await listener(db, message);
    }
);

export const usePrefix = (
    getPrefix: (db: Database, message: Message) => Promise<string>,
): Transformer<Consumer<[Database, Message]>> => (
    (listener) => async (db, message) => {
        if (message.content.startsWith(await getPrefix(db, message))) await listener(db, message);
    }
);

usePrefix.fixed = (prefix: string) => usePrefix(() => Promise.resolve(prefix));

usePrefix.fromDatabase = usePrefix(async (db: Database, message: Message) => {
    const { prefix } = await db.Guilds.get(message.guildId as string);
    return prefix;
});
