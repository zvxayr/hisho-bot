import { Command } from './types';

const say: Command = {
    name: 'say',
    parameterFormat: /^(?<text>.+)?$/s,
    async execute(_, message, { text }) {
        await message.channel.send(text ? `${text}!` : 'You need to say something.');
    },
};

export default say;
