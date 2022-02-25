import { Message } from 'discord.js';
import { Command } from '../commands';
import SqliteDatabase from '../database/sqlite';
import commandResponder from './commandResponder';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const mockCommands: { [key: string]: Command } = {
    do_nothing: {
        name: 'do_nothing',
        parameterFormat: /(?:)/,
        execute: jest.fn(),
    },
    has_number: {
        name: 'has_number',
        parameterFormat: /(?<numberParam>\d+)/,
        execute: async (_db, message, { numberParam }) => {
            const response = numberParam
                ? `Yey, a number! [${numberParam}]`
                : 'Give me a number!';
            await message.channel.send(response);
        },
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
        await db.Aliases.create('1', 'has_number a1', 'take1!');
    });

    it('should be called with correct command', async () => {
        const message = createMessage('do_nothing');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.do_nothing.execute).toBeCalledWith(db, message, {});
    });

    it('should ignore extra parameters', async () => {
        const message = createMessage('do_nothing ignore me');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.do_nothing.execute).toBeCalledWith(db, message, {});
    });

    it('should respond with error message to non-numeric inputs', async () => {
        const message = createMessage('has_number i dont have a number');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(send).toHaveBeenCalledWith('Give me a number!');
    });

    it('should respond success if message has a number', async () => {
        const message = createMessage('has_number i got 1');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(send).toHaveBeenCalledWith('Yey, a number! [1]');
    });

    it('should reject if command does not exist', async () => {
        const message = createMessage('not_a_command');
        await expect(responder(db, message)).rejects.toBeDefined();
    });

    it('should reject if command is empty', async () => {
        const message = createMessage('');
        await expect(responder(db, message)).rejects.toBeDefined();
    });

    it('should respond success on aliases', async () => {
        const message = createMessage('take1!');
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(send).toHaveBeenCalledWith('Yey, a number! [1]');
    });

    it('should still succeed for falsy guild ids', async () => {
        const message = createMessage('do_nothing', null);
        await expect(responder(db, message)).resolves.toBeUndefined();
        expect(mockCommands.do_nothing.execute).toBeCalledWith(db, message, {});
    });
});
