import { Message } from 'discord.js';
import SqliteDatabase from '../database/sqlite';
import { blockBots, usePrefix } from './guards';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Test guards', () => {
    const db = SqliteDatabase.verbose(':memory:');
    const createMessage = ({ bot = false, guildId = '123', content = '' }) => typeAssert<Message>({
        author: { bot },
        content,
        guildId,
    });
    const listener = jest.fn();

    describe('blockBots', () => {
        it('prevents listener to be called if message author is a bot', async () => {
            await blockBots(listener)(db, createMessage({ bot: true }));
            expect(listener).not.toHaveBeenCalled();
        });

        it('allows the listener to be called if message author is not a bot', async () => {
            await blockBots(listener)(db, createMessage({ bot: false }));
            expect(listener).toHaveBeenCalled();
        });
    });

    describe('usePrefix', () => {
        describe('fixed', () => {
            it('prevents the listener to be called if message content do not have the right prefix', async () => {
                await usePrefix.fixed('&')(listener)(db, createMessage({ content: '>>>help' }));
                expect(listener).not.toHaveBeenCalled();
            });

            it('allows the listener to be called if message content has the right prefix', async () => {
                await usePrefix.fixed('&')(listener)(db, createMessage({ content: '&help' }));
                expect(listener).toHaveBeenCalled();
            });
        });

        describe('fromDatabase', () => {
            beforeAll(() => db.Guilds.create('123', '>>>'));

            it('prevents the listener to be called if message content prefix does not match database content', async () => {
                await usePrefix.fromDatabase(listener)(db, createMessage({ content: '&help' }));
                expect(listener).not.toHaveBeenCalled();
            });

            it('allows the listener to be called if message content prefix matches database content', async () => {
                await usePrefix.fromDatabase(listener)(db, createMessage({ content: '>>>help' }));
                expect(listener).toHaveBeenCalled();
            });

            it('allows the listener to be called if message content prefix matches the deafult for unregistered guilds', async () => {
                await usePrefix.fromDatabase(listener)(db, createMessage({ guildId: 'xxx', content: '&help' }));
                expect(listener).toHaveBeenCalled();
            });
        });
    });
});
