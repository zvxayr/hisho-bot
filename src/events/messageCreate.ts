import { compose, curry } from 'ramda';
import commands from '../commands';
import { swallow } from '../utils';
import commandResponder from './commandResponder';
import { CommandNotFound } from './exceptions';
import { blockBots, usePrefix } from './guards';

const resolveCommand = (command: string) => commands[command];
const sendErrorBack = ({ source, message }: CommandNotFound) => {
    source.channel.send(message);
};

const safeCommandResponder = (
    swallow(CommandNotFound, sendErrorBack)(commandResponder(resolveCommand))
);

const messageCreateHandler = compose(blockBots, usePrefix.fromDatabase)(safeCommandResponder);
export default curry(messageCreateHandler);
