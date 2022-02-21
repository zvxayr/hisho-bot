/* eslint-disable import/prefer-default-export */
const raise = (error: Error) => {
    throw error;
};

type Transformer<Fn extends Function> = (fn: Fn) => Fn;

const compose = <Inner extends Function>(...fns: Transformer<Inner>[]) => (
    (x: Inner) => fns.reduceRight((v, f) => f(v), x)
);

export { raise, compose, Transformer };
