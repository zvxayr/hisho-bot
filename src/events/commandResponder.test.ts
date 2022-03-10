import { Message } from 'discord.js';
import { Command } from '../commands';
import SqliteDatabase from '../database/sqlite';
import commandResponder from './commandResponder';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const mockCommands: { [key: string]: Command } = {
    echo: <Command<string>>{
        name: 'echo',
        parseParameters: jest.fn((x) => x),
        execute: jest.fn(async (db, message, input) => {
            await message.channel.send(input);
        }),
    },
};

const send = jest.fn();
const createMessage = (content: string, guildId: string | null = '1') => typeAssert<Message>({
    content,
    guildId,
    channel: { send },
});

const mockCommandResolver = (command: string) => mockCommands[command];

describe('Test command responder', () => {
    const responder = commandResponder(mockCommandResolver);
    const db = SqliteDatabase.verbose(':memory:');

    beforeAll(async () => {
        await db.Guilds.create('1', '');
        await db.Aliases.create('1', 'echo', 'e');
    });

    it('should be called with correct command', async () => {
        const message = createMessage('echo');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.echo.parseParameters).toBeCalledWith('');
        expect(mockCommands.echo.execute).toBeCalledWith(db, message, '');
        expect(send).toBeCalledWith('');
    });

    it('should reject if command does not exist', async () => {
        const message = createMessage('not_a_command');
        await expect(responder(db, message)).rejects.toBeDefined();
        expect(send).not.toBeCalled();
    });

    it('should reject if command is empty', async () => {
        const message = createMessage('');
        await expect(responder(db, message)).rejects.toBeDefined();
        expect(send).not.toBeCalled();
    });

    it('should respond with aliases', async () => {
        const message = createMessage('e hello');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.echo.parseParameters).toBeCalledWith('hello');
        expect(mockCommands.echo.execute).toBeCalledWith(db, message, 'hello');
        expect(send).toBeCalledWith('hello');
    });

    it('should still succeed for falsy guild ids', async () => {
        const message = createMessage('echo', null);
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.echo.parseParameters).toBeCalledWith('');
        expect(mockCommands.echo.execute).toBeCalledWith(db, message, '');
        expect(send).toBeCalledWith('');
    });
});
