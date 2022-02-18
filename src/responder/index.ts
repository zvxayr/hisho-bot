import { raise } from '../utils';
import { MessageAction, Send } from './actions';

class CommandNotFound extends Error {
    command: string;

    constructor(command: string) {
        super(`The command \`${command}\` is not found.`);
        this.command = command;
        this.name = this.constructor.name;
    }
}

interface StringMap {
    [key: string]: string;
}

interface Context {
    sender: {
        id: string;
        name: string;
    };
}

interface Command {
    command: string;
    parameterFormat: RegExp;
    execute: (
        context: Context,
        args: StringMap,
    ) => AsyncGenerator<MessageAction, MessageAction | void>;
}

let commands: Command[] = [
    {
        command: 'say',
        parameterFormat: /^(?<something>.+)?$/s,
        async *execute(_, { something }) {
            yield Send(something ? `${something}!` : 'You need to say something.');
        },
    },
];

let alias: StringMap = {
    utter: 'say',
};

const getPatternGroupMatches = (pattern: RegExp, str: string) => {
    return pattern.exec(str)?.groups ?? {};
};

const decomposeCommandString = (full_command: string) => {
    const format = /^(?<command>\S+)?(?:\s+)?(?<full_argument>.*)$/s;
    const result = getPatternGroupMatches(format, full_command);
    const { command, full_argument } = result;
    return { command, full_argument };
};

const unalias = (command: string) => {
    const lower_case_command = command?.toLowerCase();
    return alias[lower_case_command] ?? lower_case_command;
};

const findCommand = (command: string) =>
    commands.find(({ command: cmd }) => cmd == command);

const responder = (context: Context, full_command: string) => {
    const { command, full_argument } = decomposeCommandString(full_command);
    const { parameterFormat: parameters, execute } =
        findCommand(unalias(command)) ?? raise(new CommandNotFound(command));
    const args = getPatternGroupMatches(parameters, full_argument);

    return execute(context, args);
};

export default responder;
export { Context };
