import { Message } from 'discord.js';
import database from '../database';
import { ICommand } from './types';

export default class Command<Params = any> implements ICommand<Params> {
    name: string;

    parseParameters: ICommand<Params>['parseParameters'];

    execute: ICommand<Params>['execute'] = async (db, message, parameterString) => {
        const params = this.parseParameters(parameterString);
        await this.exec(db, message, params);
    };

    private exec;

    constructor({ name, parseParameters, execute }: {
        name: string,
        parseParameters: ICommand<Params>['parseParameters'],
        execute: (db: database, message: Message<boolean>, params: Params) => Promise<void>,
    }) {
        this.name = name;
        this.parseParameters = parseParameters;
        this.exec = execute;
    }
}
