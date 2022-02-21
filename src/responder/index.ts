import { Message } from 'discord.js';
import { raise } from '../utils';

class CommandNotFound extends Error {
    command: string;

    source: Message;

    constructor(command: string, message: Message) {
        super(`The command \`${command}\` is not found.`);
        this.command = command;
        this.name = this.constructor.name;
        this.source = message;
    }
}

interface StringMap {
    [key: string]: string;
}

interface Command {
    command: string;
    parameterFormat: RegExp;
    execute: (
        message: Message,
        args: StringMap,
    ) => Promise<void>;
}

const commands: Command[] = [
    {
        command: 'say',
        parameterFormat: /^(?<text>.+)?$/s,
        execute: async (message, { text }) => {
            await message.channel.send(text ? `${text}!` : 'You need to say something.');
        },
    },
];

const alias: StringMap = {
    utter: 'say',
};

const getPatternGroupMatches = (pattern: RegExp, str: string) => pattern.exec(str)?.groups ?? {};

const decomposeCommandString = (fullCommand: string) => {
    const format = /^(?<prefix>\S{0,4}[!$%^&-+=<>.?~])?(?<command>\S+)?(?:\s+)?(?<fullArgument>.*)$/s;
    const result = getPatternGroupMatches(format, fullCommand);
    const { command, fullArgument } = result;
    return { command, fullArgument };
};

const unalias = (command: string) => {
    const lowerCaseCommand = command?.toLowerCase();
    return alias[lowerCaseCommand] ?? lowerCaseCommand;
};

const findCommand = (command: string) => commands.find(({ command: cmd }) => cmd === command);

const responder = (message: Message) => {
    const { command, fullArgument } = decomposeCommandString(message.content);
    const { parameterFormat, execute } = (
        findCommand(unalias(command))
        ?? raise(new CommandNotFound(command, message))
    );
    const args = getPatternGroupMatches(parameterFormat, fullArgument);
    return execute(message, args);
};

export default responder;
export { CommandNotFound };
