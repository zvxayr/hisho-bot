/* eslint-disable max-classes-per-file */
export interface Guild {
    id: string,
    prefix: string,
}

export interface Guilds {
    get: (id: string) => Promise<Guild>,
    create: (id: string, prefix: string) => Promise<void>,
    remove: (id: string) => Promise<void>,
}

export default interface Database {
    Guilds: Guilds
}
