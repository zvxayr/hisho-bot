import { Message } from 'discord.js';

export class CommandNotFound extends Error {
    command: string;

    source: Message;

    constructor(command: string, message: Message) {
        super(`The command \`${command}\` is not found.`);
        this.command = command;
        this.name = this.constructor.name;
        this.source = message;
    }
}

export default {};
