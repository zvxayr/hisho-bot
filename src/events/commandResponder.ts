import { Message } from 'discord.js';
import { CommandResolver } from '../commands/types';
import Database from '../database';
import { raise } from '../utils';
import { CommandNotFound } from './exceptions';

const getPatternGroupMatches = (pattern: RegExp, str: string) => (
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
    if (message.guildId === null) {
        return { command: aliasOrCommand, parameters: otherParameters };
    }
    const { command, partialParameters } = await unalias(db, message.guildId, aliasOrCommand);
    const parameters = `${partialParameters} ${otherParameters}`.trim();
    return { command, parameters };
}

export default (commandResolver: CommandResolver) => (
    async function commandResponder(database: Database, message: Message) {
        const { command, parameters } = await parseMessage(database, message);
        const { execute } = commandResolver(command)
            ?? raise(new CommandNotFound(command, message));
        return execute({ database, message, commandResolver }, parameters);
    }
);
