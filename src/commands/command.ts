import { Context, ICommand } from './types';

export default function createCommand<Params>({ name, parseParameters, execute }: {
    name: string,
    parseParameters: (parameter: string) => Params,
    execute: (context: Context, parameters: Params) => Promise<void>,
}): ICommand {
    return {
        name,
        execute: async (context: Context, parameter) => {
            const parameters = parseParameters(parameter);
            await execute(context, parameters);
        },
    };
}
