/* eslint-disable max-classes-per-file */
export interface Guild {
    id: number,
    prefix: string,
}

export interface Guilds {
    get: (id: number) => Promise<Guild>,
    create: (id: number, prefix: string) => Promise<void>,
    remove: (id: number) => Promise<void>,
}

export default interface Database {
    Guilds: Guilds
}
