/* eslint-disable max-classes-per-file */
export interface Guild {
    guild_id: string,
    prefix: string,
}

export interface Guilds {
    get: (guild_id: string) => Promise<Guild>,
    create: (guild_id: string, prefix: string) => Promise<void>,
    remove: (guild_id: string) => Promise<void>,
}

export interface Alias {
    guild_id: string,
    partial_command: string,
    alias: string,
}

export interface Aliases {
    unalias: (guild_id: string, alias: string) => Promise<string>,
    create: (guild_id: string, partial_command: string, alias: string) => Promise<void>,
    remove: (guild_id: string, alias: string) => Promise<void>,
}

export default interface Database {
    Guilds: Guilds,
    Aliases: Aliases,
}
