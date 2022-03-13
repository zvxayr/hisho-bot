import say from './say';
import { ICommand } from './types';

const commandsList: ICommand[] = [
    say,
];

type CommandMap = { [key: string]: ICommand | undefined };
const commands = commandsList.reduce((acc, command) => {
    acc[command.name] = command;
    return acc;
}, {} as CommandMap);

export default commands;
