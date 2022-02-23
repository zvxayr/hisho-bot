import { Message } from 'discord.js';
import Database from '../database';

type Transformer<Value> = (value: Value) => Value;
type Consumer<Args extends any[]> = (...args: Args) => void;

export const noBots: Transformer<Consumer<[Database, Message]>> = (listener) => (db, message) => {
    if (!message.author.bot) listener(db, message);
};

export const usePrefix = (
    getPrefix: (message: Message) => string,
): Transformer<Consumer<[Database, Message]>> => (
    (listener) => (db, message) => {
        if (message.content.startsWith(getPrefix(message))) listener(db, message);
    }
);

usePrefix.fixed = (prefix: string) => usePrefix(() => prefix);
