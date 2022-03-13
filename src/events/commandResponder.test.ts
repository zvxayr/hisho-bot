import { Message } from 'discord.js';
import SqliteDatabase from '../database/sqlite';
import commandResponder from './commandResponder';
import { CommandNotFound } from './exceptions';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const echo = {
    name: 'echo',
    execute: jest.fn(),
};

const createMessage = (content: string, guildId: string | null = '1') => typeAssert<Message>({
    content,
    guildId,
});

const mockCommandResolver = (command: string) => (command === 'echo' ? echo : undefined);

describe('commandResponder', () => {
    const responder = commandResponder(mockCommandResolver);
    const db = SqliteDatabase.verbose(':memory:');

    beforeAll(async () => {
        await db.Guilds.create('1', '');
        await db.Aliases.create('1', 'echo', 'e');
    });

    it('calls the execute method of resolved commands', async () => {
        const message = createMessage('echo');
        await responder(db, message);
        expect(echo.execute).toBeCalled();
    });

    it('throws a CommandNotFound error if command is not resolved', async () => {
        const message = createMessage('not_a_command');
        await expect(responder(db, message)).rejects.toEqual(new CommandNotFound('not_a_command', message));
    });

    it('throws a CommandNotFound error if command is empty', async () => {
        const message = createMessage('');
        await expect(responder(db, message)).rejects.toEqual(new CommandNotFound('', message));
    });

    it('calls the execute method of aliased commands', async () => {
        const message = createMessage('e');
        await responder(db, message);
        expect(echo.execute).toBeCalled();
    });

    it('throws a CommandNotFound error if command is not resolved for non-guild commands', async () => {
        const message = createMessage('not_a_command', null);
        await expect(responder(db, message)).rejects.toEqual(new CommandNotFound('not_a_command', message));
    });

    it('calls the execute method of non-guild commands', async () => {
        const message = createMessage('echo', null);
        await responder(db, message);
        expect(echo.execute).toBeCalled();
    });
});
