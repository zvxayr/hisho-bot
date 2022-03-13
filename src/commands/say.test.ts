import { Message } from 'discord.js';
import say from './say';
import { Context } from './types';

const typeAssert = <T>(value: any): T => (value as unknown) as T;
const createContext = (message: Message) => typeAssert<Context>({
    message,
});

describe('Command: say', () => {
    const message = typeAssert<Message>({
        channel: {
            send: jest.fn(),
        },
    });
    const context = createContext(message);

    it('sends the message back with an exclamation point appended', () => {
        say.execute(context, 'Hello');
        expect(message.channel.send).toHaveBeenCalledWith('Hello!');
    });

    it('sends an error message if the input is empty', () => {
        say.execute(context, '');
        expect(message.channel.send).toHaveBeenCalledWith('You need to say something.');
    });
});
