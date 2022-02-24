import { Message } from 'discord.js';
import { compose } from 'ramda';
import commands from '../commands';
import Database from '../database';
import { raise, swallow } from '../utils';
import { CommandNotFound } from './exceptions';
import { noBots, usePrefix } from './guards';

const getPatternGroupMatches = (pattern: RegExp, str: string) => pattern.exec(str)?.groups ?? {};

type DecomposedMessageContent = { aliasOrCommand: string, otherParameters: string };
const decomposeMessageContent = (content: string) => {
    const format = /^(?<prefix>\S{0,4}[!$%^&-+=<>.?~])?(?<aliasOrCommand>\S+)?(?:\s+)?(?<otherParameters>.*)$/s;
    return <DecomposedMessageContent>getPatternGroupMatches(format, content);
};

type Unaliased = { command: string, partialParameters: string };
const unalias = async (db: Database, guildId: string, aliasOrCommand: string) => {
    const format = /^(?<command>\w+)(?:\s+)?(?<partialParameters>.*)/;
    const unaliased = await db.Aliases.unalias(guildId, aliasOrCommand.toLowerCase());
    return <Unaliased>getPatternGroupMatches(format, unaliased);
};

const findCommand = (command: string) => commands.find(({ name }) => name === command);

const commandResponder = async (db: Database, message: Message) => {
    const { aliasOrCommand, otherParameters } = decomposeMessageContent(message.content);
    const { command, partialParameters } = await unalias(db, message.guildId ?? '', aliasOrCommand);
    const { parameterFormat, execute } = (
        findCommand(command) ?? raise(new CommandNotFound(aliasOrCommand, message))
    );
    const fullParameters = `${partialParameters} ${otherParameters}`;
    const args = getPatternGroupMatches(parameterFormat, fullParameters);
    return execute(db, message, args);
};

const sendErrorBack = ({ source, message }: CommandNotFound) => {
    source.channel.send(message);
};

const safeCommandResponder = swallow(CommandNotFound, sendErrorBack)(commandResponder);
const messageCreateHandler = compose(noBots, usePrefix.fromDatabase)(safeCommandResponder);
export default messageCreateHandler;
