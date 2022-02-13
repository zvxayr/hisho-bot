let raise = (error) => { throw error };

let rescue = (error, type) =>
    error instanceof type
        ? error
        : raise(error)
;

let swallow = (type) => (fail) => (fn) => async (...args) => {
    try {
        return await fn(...args);
    } catch (error) {
        rescue(error, type);
        return await fail(error);
    }
}

let compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

export {
    raise,
    rescue,
    swallow,
    compose
}
