import { raise } from "../utils";

class CommandNotFound extends Error {
    constructor(command) {
        super(`The command \`${command}\` is not found.`);
        this.command = command;
        this.name = this.constructor.name;
    }
}

let commands = [
    {
        command: 'say',
        parameters: /^(.+)?$/s,
        async *execute (something) {
            yield {
                type: 'Send',
                payload: something ? `${something}!` : 'You need to say something.'
            }
        }
    }
];

let alias = {
    'utter': 'say'
}

const decomposeCommand = (full_command) => {
    const format = /^(\S+)?(?:\s+)?(.*)$/s;
    const [, command, full_argument] = format.exec(full_command);
    return { command, full_argument };
}

const unalias = (command) => {
    const lower_case_command = command?.toLowerCase();
    return alias[lower_case_command] ?? lower_case_command;
}

const findCommand = (command) => command && commands
    .find(({ command: cmd }) => cmd == command);

const responder = (full_command) => {
    const { command, full_argument } = decomposeCommand(full_command);
    const { parameters, execute } = findCommand(unalias(command))
        ?? raise(new CommandNotFound(test_command));
    const args = parameters.exec(full_argument).slice(1);
    return execute(...args);
}

export default responder;
