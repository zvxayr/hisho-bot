import { Message } from 'discord.js';
import { ICommand } from '../commands/types';
import Database from '../database';
import { raise } from '../utils';
import { CommandNotFound } from './exceptions';

export const getPatternGroupMatches = (pattern: RegExp, str: string) => (
    pattern.exec(str)?.groups ?? {});

type DecomposedMessageContent = { aliasOrCommand?: string, otherParameters: string };
const decomposeMessageContent = (content: string) => {
    const format = /^(?<prefix>\S{0,4}[!$%^&-+=<>.?~])?(?<aliasOrCommand>\S+)?(?:\s+)?(?<otherParameters>.*)$/s;
    return <DecomposedMessageContent>getPatternGroupMatches(format, content);
};

type Unaliased = { command: string, partialParameters: string };
const unalias = async (db: Database, guildId: string, aliasOrCommand: string) => {
    const format = /^(?<command>\w+)(?:\s+)?(?<partialParameters>.*)/;
    const unaliased = await db.Aliases.unalias(guildId, aliasOrCommand.toLowerCase());
    if (unaliased) return <Unaliased>getPatternGroupMatches(format, unaliased);
    return { command: aliasOrCommand, partialParameters: '' };
};

async function parseMessage(db: Database, message: Message) {
    const { aliasOrCommand = '', otherParameters } = decomposeMessageContent(message.content);
    const { command, partialParameters } = await unalias(db, message!.guildId ?? '', aliasOrCommand);
    const fullParameters = `${partialParameters} ${otherParameters}`.trimStart();

    return { command, fullParameters };
}

export default (commandResolver: (command: string) => ICommand | undefined) => (
    async function commandResponder(db: Database, message: Message) {
        const { command, fullParameters } = await parseMessage(db, message);
        const { execute } = (
            commandResolver(command) ?? raise(new CommandNotFound(command, message))
        );
        return execute(db, message, fullParameters);
    }
);
