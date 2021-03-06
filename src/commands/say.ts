import createCommand from './command';
import { StringValuedObject } from './types';

const say = createCommand<StringValuedObject<['text']>>({
    name: 'say',
    parseParameters: (paramString) => ({ text: paramString }),
    async execute({ message }, { text }) {
        await message.channel.send(text ? `${text}!` : 'You need to say something.');
    },
});

export default say;
