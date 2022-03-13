import createCommand from './command';
import { Context } from './types';

const typeAssert = <T>(value: any): T => (value as unknown) as T;

const listifyRaw = {
    name: 'listify',
    parseParameters: jest.fn((parameter: string) => parameter.split(/\s+/)),
    execute: jest.fn(),
};

const context = typeAssert<Context>({});

describe('createCommand', () => {
    const listify = createCommand(listifyRaw);

    it('passes the parameter as input for the parse parameters', async () => {
        await listify.execute(context, 'Hello World!');
        expect(listifyRaw.parseParameters).toHaveBeenCalledWith('Hello World!');
    });

    it('calls the execute method of the input with the output of the parseParameters', async () => {
        await listify.execute(context, 'Hello World!');
        await listify.execute(context, "I'm alive!");
        await listify.execute(context, '');
        for (const parseParametersReturn of listifyRaw.parseParameters.mock.results) {
            expect(listifyRaw.execute).toHaveBeenCalledWith(context, parseParametersReturn.value);
        }
    });
});
