import { Command } from './types';

const say: Command = {
    command: 'say',
    parameterFormat: /^(?<text>.+)?$/s,
    execute: async function (message, { text }) {
        await message.channel.send(text ? `${text}!` : 'You need to say something.');
    },
};

export default say;
