import { Message } from 'discord.js';
import Database from '../database';

export interface Command {
    name: string;
    parameterFormat: RegExp;
    execute: (
        db: Database,
        message: Message,
        args: { [key: string]: string; },
    ) => Promise<void>;
}
