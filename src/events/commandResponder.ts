import { Message } from 'discord.js';
import { Command } from '../commands';
import Database from '../database';
import { raise } from '../utils';
import { CommandNotFound } from './exceptions';

const getPatternGroupMatches = (pattern: RegExp, str: string) => pattern.exec(str)?.groups ?? {};

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

export default (commandResolver: (command: string) => Command | undefined) => (
    async function commandResponder(db: Database, message: Message) {
        const { aliasOrCommand = '', otherParameters } = decomposeMessageContent(message.content);
        const { command, partialParameters } = await unalias(db, message.guildId ?? '', aliasOrCommand);
        const { parameterFormat, execute } = (
            commandResolver(command) ?? raise(new CommandNotFound(aliasOrCommand, message))
        );
        const fullParameters = `${partialParameters} ${otherParameters}`.trimStart();
        const args = getPatternGroupMatches(parameterFormat, fullParameters);
        return execute(db, message, args);
    }
);
