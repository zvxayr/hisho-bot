import { raise } from "../utils";

class CommandNotFound extends Error {

    command: string;

    constructor(command: string) {
        super(`The command \`${command}\` is not found.`);
        this.command = command;
        this.name = this.constructor.name;
    }
}

interface Action {
    type: string,
    payload: string
}

interface Context {
    sender: {
        id: string,
        name: string,
    }
}

interface Command {
    command: string,
    parameters: RegExp,
    execute: (context: Context, ...args: string[]) => AsyncGenerator<Action, Action | void>
}

let commands: Command[] = [
    {
        command: 'say',
        parameters: /^(.+)?$/s,
        async *execute(_, something) {
            yield {
                type: 'Send',
                payload: something ? `${something}!` : 'You need to say something.'
            }
        }
    }
];

interface Alias {
    [key: string]: string
}

let alias: Alias = {
    'utter': 'say'
}

const decomposeCommand = (full_command: string) => {
    const format = /^(\S+)?(?:\s+)?(.*)$/s;
    const result = format.exec(full_command) ?? [];
    const [, command = '', full_argument = ''] = result;
    return { command, full_argument };
}

const unalias = (command: string) => {
    const lower_case_command = command?.toLowerCase();
    return alias[lower_case_command] ?? lower_case_command;
}

const findCommand = (command: string) => commands
    .find(({ command: cmd }) => cmd == command);

const responder = (context: Context, full_command: string) => {
    const { command, full_argument } = decomposeCommand(full_command);
    const { parameters, execute } = findCommand(unalias(command))
        ?? raise(new CommandNotFound(command));
    const args = parameters.exec(full_argument)?.slice(1) ?? [];

    return execute(context, ...args);
}

export default responder;
export {
    Context,
};
