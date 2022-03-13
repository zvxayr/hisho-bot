import { Message } from 'discord.js';
import Database from '../database';
import say from './say';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Command: say', () => {
    const database = typeAssert<Database>({});
    const message = typeAssert<Message>({
        channel: {
            send: jest.fn(),
        },
    });

    it('sends the message back with an exclamation point appended', () => {
        say.execute({ database, message }, 'Hello');
        expect(message.channel.send).toHaveBeenCalledWith('Hello!');
    });

    it('sends an error message if the input is empty', () => {
        say.execute({ database, message }, '');
        expect(message.channel.send).toHaveBeenCalledWith('You need to say something.');
    });
});
