import { CompendiumItem } from "./compendium";

export type PluginTag =
    | "system"
    | "dice"
    | "character_sheet"
    | "character_loader"
    | "npc_source"
    | "npc_builder"
    | "documents"
    | "asset_pack"
    | "data_source";

// Minimal plugin model (/api/plugins)
export type MinimalPluginModel = {
    slug: string;
    displayName: string;
    tags: PluginTag[];
    dependencies: string[];
};

// Plugin manifest supermodel (/api/plugins/{plugin})
export type PluginDataModel = {
    slug: string;
    display_name: string;
    tags: string[];
    libraries?: string[];
    dependencies?: string[];
};

export type EntrypointModel = {
    file: string;
    controllers?: string[];
    exports?: string[];
};

// Dice Plugin Manifest Type
export type RollImplementationModel =
    | {
          type: "integer";
          type_map: { [key: string]: number[] };
      }
    | {
          type: "selection";
          type_map: { [key: string]: (number | string)[] };
      };

export type DiceModel = {
    types: string[];
    roll_implementation: RollImplementationModel;
    implements_object?: boolean;
    implements_string?: boolean;
    reroll_operations: { [key: string]: string };
};

// Data Source
export type SearchField = {
    field: string | string[];
    type: "string" | "number" | "boolean" | "select";
    label: string;
};

export type DataSourceCategory = {
    display_name: string;
    search_fields: { [key: string]: SearchField };
    files: string[];
    renderer: CompendiumItem;
};

export type DataSource = {
    kwargs: { [key: string]: any };
    default_category: string;
    categories: { [key: string]: DataSourceCategory };
};

// Search
export type DataSearchField = {
    field_type: "string" | "number" | "boolean" | "select";
    value: string;
    comparator?: "<" | "<=" | "=" | ">=" | ">" | "!=";
    exact?: boolean;
};

export type DataSearch = {
    category: string;
    all_required: boolean;
    fields: { [key: string]: DataSearchField };
};

export type SearchParams = {
    choices?: string[];
    min?: number;
    max?: number;
};

// Manifest type
export type PluginManifest = {
    plugin_data: PluginDataModel;
    entrypoints: { [key: string]: EntrypointModel };
    dice?: DiceModel;
    data_source?: DataSource;
    assets?: { [key: string]: string };
};
