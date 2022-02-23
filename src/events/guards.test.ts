import { Message } from 'discord.js';
import SqliteDatabase from '../database/sqlite';
import { noBots, usePrefix } from './guards';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

describe('Test guards', () => {
    const db = SqliteDatabase.verbose(':memory:');
    const createMessage = ({ bot = false, guildId = '123', content = '' }) => typeAssert<Message>({
        author: { bot },
        content,
        guildId,
    });
    const listener = jest.fn();

    describe('test noBots', () => {
        it('should not allow bots', async () => {
            await noBots(listener)(db, createMessage({ bot: true }));
            expect(listener).not.toHaveBeenCalled();
        });

        it('should allow non-bots', async () => {
            await noBots(listener)(db, createMessage({ bot: false }));
            expect(listener).toHaveBeenCalled();
        });
    });

    describe('test usePrefix', () => {
        beforeAll(() => db.Guilds.create('123', '>>>'));

        it('should allow if prefix matches', async () => {
            await usePrefix.fixed('&')(listener)(db, createMessage({ content: '&help' }));
            expect(listener).toHaveBeenCalled();
        });

        it('should not allow if prefix does not matches', async () => {
            await usePrefix.fixed('&')(listener)(db, createMessage({ content: '>>>help' }));
            expect(listener).not.toHaveBeenCalled();
        });

        it('should not allow if prefix does not match with database content', async () => {
            await usePrefix.fromDatabase(listener)(db, createMessage({ content: '&help' }));
            expect(listener).not.toHaveBeenCalled();
        });

        it('should allow if default prefix is used and not in db', async () => {
            await usePrefix.fromDatabase(listener)(db, createMessage({ guildId: 'xxx', content: '&help' }));
            expect(listener).toHaveBeenCalled();
        });
    });
});
