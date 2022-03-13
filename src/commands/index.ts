import say from './say';
import { CommandMap, ICommand } from './types';

const commandsList: ICommand[] = [
    say,
];

const commands = commandsList.reduce((acc, command) => {
    acc[command.name] = command;
    return acc;
}, {} as CommandMap);

export default commands;
