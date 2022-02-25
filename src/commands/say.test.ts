import { Message } from 'discord.js';
import Database from '../database';
import say from './say';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Execute Command Say', () => {
    const db = typeAssert<Database>({});
    const message = typeAssert<Message>({
        channel: {
            send: jest.fn(),
        },
    });

    it('should call send with "Hello!"', () => {
        say.execute(db, message, { text: 'Hello' });
        expect(message.channel.send).toHaveBeenCalledWith('Hello!');
    });

    it('should call send with the error message', () => {
        say.execute(db, message, { text: '' });
        expect(message.channel.send).toHaveBeenCalledWith('You need to say something.');
    });
});
