export type MinimalGame = {
    id: string;
    name: string;
    owner_id: string;
    owner_name: string;
    system: string;
    image: string;
    participants: string[];
    plugins: string[];
    game_master: string;
};
