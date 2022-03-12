import { Message } from 'discord.js';
import Database from '../database';

export type SameValuedObject<Keys extends readonly string[], Value> = {
    [key in Keys[number]]: Value;
};

export type StringValuedObject<Keys extends readonly string[]> = SameValuedObject<Keys, string>;

export interface ICommand<Params = any> {
    name: string;
    parseParameters: (parameter: string) => Params;
    execute: (
        db: Database,
        message: Message,
        parameter: string,
    ) => Promise<void>;
}
