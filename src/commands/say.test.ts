import { Message } from 'discord.js';
import say from './say';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Execute Command Say', () => {
    const message = typeAssert<Message>({
        channel: {
            send: jest.fn(),
        },
    });

    it('should call send with "Hello!"', () => {
        say.execute(message, { text: 'Hello' });
        expect(message.channel.send).toHaveBeenCalledWith('Hello!');
    });

    it('should call send not with "!" if input is falsy', () => {
        say.execute(message, { text: '' });
        expect(message.channel.send).not.toHaveBeenCalledWith('!');
    });

    it('should call send with the error message', () => {
        say.execute(message, {});
        expect(message.channel.send).toHaveBeenCalledWith('You need to say something.');
    });
});
