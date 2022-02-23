const raise = (error: Error) => {
    throw error;
};

const rescue = (error: Error, type: new (...args: any[]) => Error) => {
    if (!(error instanceof type)) raise(error);
};

type ErrorType<E extends Error> = new (...args: any[]) => E;
type ErrorHandler<E extends Error> = (err: E) => void;

const swallow = (
    <E extends Error>(type: ErrorType<E>, fail: ErrorHandler<E>) => (
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
