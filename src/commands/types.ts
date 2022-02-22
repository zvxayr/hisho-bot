import { Message } from 'discord.js';

export interface Command {
    name: string;
    parameterFormat: RegExp;
    execute: (
        message: Message,
        args: { [key: string]: string; },
    ) => Promise<void>;
}
