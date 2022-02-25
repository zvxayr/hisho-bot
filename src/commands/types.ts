import { Message } from 'discord.js';
import Database from '../database';

export type SameValuedObject<Keys extends readonly string[], Value> = {
    [key in Keys[number]]: Value;
};

export type StringValuedObject<Keys extends readonly string[]> = SameValuedObject<Keys, string>;

export interface Command<Params = any> {
    name: string;
    parseParameters: (parameterString: string) => Params;
    execute: (
        db: Database,
        message: Message,
        args: Params,
    ) => Promise<void>;
}
