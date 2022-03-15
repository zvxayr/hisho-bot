import { Message } from 'discord.js';
import SqliteDatabase from '../database/sqlite';

import alias from './alias';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const message = typeAssert<Message>({
    guildId: '1',
    channel: {
        send: jest.fn(),
    },
});
const database = SqliteDatabase.verbose(':memory:');
const commandResolver = (command: string) => (
    command === 'alias' ? alias : undefined
);
const context = { message, database, commandResolver };

describe('Command: alias', () => {
    beforeAll(() => {
        database.Guilds.create('1', '&');
    });

    it('responds with an error message if paramenters were not provided', async () => {
        await alias.execute(context, '');
        expect(message.channel.send).toHaveBeenCalledWith('Please enter parameters.');
    });

    describe('add alias', () => {
        it('adds the alias to the Alias table if it does not conflict with existing commands and aliases', async () => {
            await alias.execute(context, 'arem alias remove');
            await expect(database.Aliases.unalias('1', 'arem')).resolves.toBe('alias remove');
        });

        it('responds with an error message if the partial command is not provided', async () => {
            await alias.execute(context, 'a');
            expect(message.channel.send).toHaveBeenCalledWith('Did you mean `alias a <command>?`');
        });

        it('responds with an error message if the alias already exists', async () => {
            await alias.execute(context, 'arem alias remove');
            expect(message.channel.send).toHaveBeenCalledWith('Alias `arem` already exists. Did you mean `alias replace arem alias remove?`');
        });

        it('responds with an error message if the alias is a valid command', async () => {
            await alias.execute(context, 'alias alias');
            expect(message.channel.send).toHaveBeenCalledWith('The chosen alias `alias` is a command. Try choosing a different alias.');
        });
    });

    describe('remove alias', () => {
        it('removes existing alias from the database', async () => {
            await alias.execute(context, 'remove arem');
            await expect(database.Aliases.unalias('1', 'arem')).resolves.toBeUndefined();
        });

        it('responds with a success even if the alias does not exist', async () => {
            await alias.execute(context, 'remove arem');
            expect(message.channel.send).toHaveBeenCalledWith('Alias `arem` removed.');
        });
    });

    describe('replace alias', () => {
        it('adds the alias to the Alias table if the alias does not exist', async () => {
            await alias.execute(context, 'replace ar alias replace');
            await expect(database.Aliases.unalias('1', 'ar')).resolves.toBe('alias replace');
        });

        it('replaces the alias from the Alias table if the alias exists', async () => {
            await alias.execute(context, 'replace ar alias remove');
            await expect(database.Aliases.unalias('1', 'ar')).resolves.toBe('alias remove');
        });

        it('responds with an error message if the alias is a valid command', async () => {
            await alias.execute(context, 'replace alias alias');
            expect(message.channel.send).toHaveBeenCalledWith('The chosen alias `alias` is a command. Try choosing a different alias.');
        });
    });
});
