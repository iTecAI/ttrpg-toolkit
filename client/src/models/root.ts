export type ConstraintsModel = {
    max_games: number;
    max_characters: number;
};

export type RootModel = {
    debug: boolean;
    plugins: string[];
    constraints: ConstraintsModel;
};
