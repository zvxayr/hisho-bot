import { Message } from 'discord.js';
import commands from '../commands';
import { compose, raise, swallow } from '../utils';
import { CommandNotFound } from './exceptions';
import { noBots, usePrefix } from './guards';

const alias: {
    [key: string]: string;
} = {
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

const findCommand = (command: string) => commands.find(({ name }) => name === command);

const commandResponder = (message: Message) => {
    const { command, fullArgument } = decomposeCommandString(message.content);
    const { parameterFormat, execute } = (
        findCommand(unalias(command))
        ?? raise(new CommandNotFound(command, message))
    );
    const args = getPatternGroupMatches(parameterFormat, fullArgument);
    return execute(message, args);
};

const safeCommandResponder = swallow(CommandNotFound)(({ source, message }) => {
    source.channel.send(message);
})(commandResponder);

const messageCreateHandler = compose(noBots, usePrefix.fixed('&'))(safeCommandResponder);
export default messageCreateHandler;
