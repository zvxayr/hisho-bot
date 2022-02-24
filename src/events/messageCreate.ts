import { compose } from 'ramda';
import commands from '../commands';
import { swallow } from '../utils';
import commandResponder from './commandResponder';
import { CommandNotFound } from './exceptions';
import { noBots, usePrefix } from './guards';

const resolveCommand = (command: string) => commands.find(({ name }) => name === command);
const sendErrorBack = ({ source, message }: CommandNotFound) => {
    source.channel.send(message);
};

const safeCommandResponder = (
    swallow(CommandNotFound, sendErrorBack)(commandResponder(resolveCommand))
);

const messageCreateHandler = compose(noBots, usePrefix.fromDatabase)(safeCommandResponder);
export default messageCreateHandler;
