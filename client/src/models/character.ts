export type Character = {
    oid: string;
    game_id: string;
    owner_id: string;
    name: string;
    avatar?: string;
    [key: string]: any;
};
