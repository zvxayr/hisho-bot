import { Message } from 'discord.js';
import Database from '../database';

export type SameValuedObject<Keys extends readonly string[], Value> = {
    [key in Keys[number]]: Value;
};

export type StringValuedObject<Keys extends readonly string[]> = SameValuedObject<Keys, string>;

export interface Context {
    database: Database,
    message: Message,
}

export interface ICommand {
    name: string;
    execute: (
        context: Context,
        parameter: string,
    ) => Promise<void>;
}
