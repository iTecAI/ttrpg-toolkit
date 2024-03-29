import { AllRenderItems } from "../libs/modular-renderer/types";
import { AbstractIconType } from "../util/AbstractIcon";
import { CompendiumItem } from "./compendium";

export type PluginTag =
    | "system"
    | "dice"
    | "character_sheet"
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
    tags: PluginTag[];
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
    value: string | string[];
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

export type DocumentType = {
    slug: string;
    displayName: string;
    icon: { type: AbstractIconType; name: string };
    description?: string;
    form: AllRenderItems;
};

export type CharacterSheetLoader = {
    name: string;
    endpoint: string;
    form: AllRenderItems;
};

export type CharacterSheetBuilder = {
    endpoint: string;
    tabs: { slug: string; displayName: string; form: AllRenderItems }[];
};

export type CharacterSheetModel = {
    slug: string;
    displayName: string;
    loaders?: CharacterSheetLoader[];
    builder: CharacterSheetBuilder;
    objectModel: {
        entrypoint: string;
        export: string;
    };
};

// Manifest type
export type PluginManifest = {
    plugin_data: PluginDataModel;
    entrypoints: { [key: string]: EntrypointModel };
    dice?: DiceModel;
    data_source?: DataSource;
    assets?: { [key: string]: string };
    documentTypes?: { [key: string]: DocumentType };
    characterTypes?: { [key: string]: CharacterSheetModel };
};
