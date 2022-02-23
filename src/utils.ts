/* eslint-disable import/prefer-default-export */
const raise = (error: Error) => {
    throw error;
};

const rescue = (error: Error, type: new (...args: any[]) => Error) => {
    if (!(error instanceof type)) raise(error);
};

const swallow = (
    <E extends Error>(type: new (...args: any[]) => E) => (fail: (err: E) => void) => (
        <Args extends any[]>(fn: (...args: Args) => Promise<void>) => async (...args: Args) => {
            try {
                await fn(...args);
            } catch (error: any) {
                rescue(error, type);
                fail(error);
            }
        }
    )
);

export {
    raise,
    swallow,
};
