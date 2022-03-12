import { Message } from 'discord.js';
import Database from '../database';
import say from './say';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Command: say', () => {
    const db = typeAssert<Database>({});
    const message = typeAssert<Message>({
        channel: {
            send: jest.fn(),
        },
    });

    it('sends the message back with an exclamation point appended', () => {
        say.execute(db, message, 'Hello');
        expect(message.channel.send).toHaveBeenCalledWith('Hello!');
    });

    it('sends an error message if the input is empty', () => {
        say.execute(db, message, '');
        expect(message.channel.send).toHaveBeenCalledWith('You need to say something.');
    });
});
