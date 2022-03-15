import { compose } from 'ramda';
import createCommand from './command';
import { Context } from './types';

interface Parsed {
    action: 'add' | 'remove' | 'replace',
    alias: string,
    command?: string,
    partial_parameters?: string,
}

type Action = (ctx: Context, args: Omit<Parsed, 'action'>) => Promise<void>;
type Transformer<Value> = (value: Value) => Value;

function actionGuard(
    condition: (...args: Parameters<Action>) => Promise<any> | any,
    message: (...args: Parameters<Action>) => Promise<string> | string,
) {
    return <Transformer<Action>>((listener) => async (ctx, args) => {
        if (await condition(ctx, args)) {
            ctx.message.channel.send(await message(ctx, args));
            return;
        }

        await listener(ctx, args);
    });
}

const hasParameterAlias = actionGuard((_, { alias }) => !alias, () => 'Please enter parameters.');
const hasParameterCommand = actionGuard(
    (_, { command }) => !command,
    (_, { alias }) => `Did you mean \`alias ${alias} <command>?\``,
);
const notAnExistingCommand = actionGuard(
    ({ commandResolver }, { alias }) => commandResolver(alias),
    (_, { alias }) => `The chosen alias \`${alias}\` is a command. Try choosing a different alias.`,
);

const add: Action = async (
    { database: { Aliases }, message },
    { alias, command, partial_parameters },
) => {
    try {
        await Aliases.create(message.guildId as string, `${command} ${partial_parameters}`, alias);
    } catch (error) {
        await message.channel.send(`Alias \`${alias}\` already exists. Did you mean \`alias replace ${alias} ${command} ${partial_parameters}?\``);
    }
};

const remove: Action = async ({ database: { Aliases }, message }, { alias }) => {
    await Aliases.remove(message.guildId as string, alias);
    await message.channel.send(`Alias \`${alias}\` removed.`);
};

const replace: Action = async (
    { database: { Aliases }, message },
    { alias, command, partial_parameters },
) => {
    await Aliases.remove(message.guildId as string, alias);
    await Aliases.create(message.guildId as string, `${command} ${partial_parameters}`, alias);
};

const actions: {
    [action in Parsed['action']]: Action
} = {
    add: compose(hasParameterAlias, hasParameterCommand, notAnExistingCommand)(add),
    remove,
    replace: notAnExistingCommand(replace),
};

export default createCommand<Parsed>({
    name: 'alias',
    parseParameters: (paramString) => {
        const pattern = /(?:(?<action>remove|replace)\s+)?(?<alias>\w+)(?:\s+(?<command>\w+)\s*(?<partial_parameters>.+)?)?/;
        const matches = { ...pattern.exec(paramString)?.groups };

        return {
            action: (matches.action?.toLocaleLowerCase() ?? 'add') as Parsed['action'],
            alias: matches.alias,
            command: matches.command,
            partial_parameters: matches.partial_parameters,
        };
    },
    async execute(context, { action, ...rest }) {
        await actions[action](context, rest);
    },
});
