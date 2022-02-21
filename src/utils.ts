/* eslint-disable import/prefer-default-export */
const raise = (error: Error) => {
    throw error;
};

const rescue = (error: Error, type: new (...args: any[]) => Error) => {
    if (!(error instanceof type)) raise(error);
};

const swallow = (
    <E extends Error>(type: new (...args: any[]) => E) => (fail: (err: E) => void) => (
        <Args extends any[]>(fn: (...args: Args) => void) => (...args: Args) => {
            try {
                fn(...args);
            } catch (error: any) {
                rescue(error, type);
                fail(error);
            }
        }
    )
);

type Transformer<Value> = (value: Value) => Value;

const compose = <Inner extends Function>(...fns: Transformer<Inner>[]) => (
    (x: Inner) => fns.reduceRight((v, f) => f(v), x)
);

export {
    raise,
    compose,
    swallow,
    Transformer,
};
