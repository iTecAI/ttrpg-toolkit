export type PluginTag = "dice" | "character" | "npc" | "system";

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

// Manifest type
export type PluginManifest = {
    plugin_data: PluginDataModel;
    entrypoints: { [key: string]: EntrypointModel };
    dice?: DiceModel;
};
