import { Command, StringValuedObject } from './types';

const say: Command<StringValuedObject<['text']>> = {
    name: 'say',
    parseParameters: (paramString) => ({ text: paramString }),
    async execute(_, message, { text }) {
        await message.channel.send(text ? `${text}!` : 'You need to say something.');
    },
};

export default say;
