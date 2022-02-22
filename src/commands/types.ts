import { Message } from 'discord.js';

export interface Command {
    command: string;
    parameterFormat: RegExp;
    execute: (
        message: Message,
        args: { [key: string]: string; },
    ) => Promise<void>;
}
