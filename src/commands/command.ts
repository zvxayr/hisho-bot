import { Message } from 'discord.js';
import database from '../database';
import { ICommand } from './types';

export default function createCommand<Params>({ name, parseParameters, execute }: {
    name: string,
    parseParameters: (parameter: string) => Params,
    execute: (db: database, message: Message<boolean>, parameters: Params) => Promise<void>,
}): ICommand {
    return {
        name,
        execute: async (db, message, parameter) => {
            const parameters = parseParameters(parameter);
            await execute(db, message, parameters);
        },
    };
}
