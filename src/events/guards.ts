import { Message } from 'discord.js';

type Transformer<Value> = (value: Value) => Value;
type Listener<Event> = (event: Event) => void;

export const noBots: Transformer<Listener<Message>> = (listener) => (message) => {
    if (!message.author.bot) listener(message);
};

export const usePrefix = (
    getPrefix: (message: Message) => string,
): Transformer<Listener<Message>> => (
    (listener) => (message) => {
        if (message.content.startsWith(getPrefix(message))) listener(message);
    }
);

usePrefix.fixed = (prefix: string) => usePrefix(() => prefix);
