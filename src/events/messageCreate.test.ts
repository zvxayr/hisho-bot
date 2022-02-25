import { Message } from 'discord.js';
import { partial } from 'ramda';
import { messageCreateHandler } from '.';
import SqliteDatabase from '../database/sqlite';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const send = jest.fn();
const createMessage = (
    content: string,
    guildId: string = '0',
    bot: boolean = false,
) => typeAssert<Message>({
    content,
    guildId,
    author: { bot },
    channel: { send },
});

describe('Test command responder', () => {
    const db = SqliteDatabase.verbose(':memory:');
    const handler = partial(messageCreateHandler, [db]);

    beforeAll(async () => {
        await db.Guilds.create('1', '&');
        await db.Guilds.create('2', '>>');
        await db.Guilds.create('3', '!');
    });

    it('should ignore bots', async () => {
        await handler(createMessage('', '', true));
        await handler(createMessage('&', '1', true));
        await handler(createMessage('>>', '2', true));
        await handler(createMessage('!', '3', true));
        expect(send).not.toHaveBeenCalled();
    });

    it('should ignore wrong prefixes', async () => {
        await handler(createMessage('xx>', '1'));
        await handler(createMessage('xx>', '2'));
        await handler(createMessage('xx>', '3'));
        expect(send).not.toHaveBeenCalled();
    });

    it('should respond for right prefixes', async () => {
        await handler(createMessage('&', '1'));
        await handler(createMessage('>>', '2'));
        await handler(createMessage('!', '3'));
        expect(send).toHaveBeenCalledTimes(3);
    });

    it('should respond if using default prefix for unregistered guilds', async () => {
        await handler(createMessage('&'));
        expect(send).toHaveBeenCalled();
    });
});
