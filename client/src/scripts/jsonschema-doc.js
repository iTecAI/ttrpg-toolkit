// main.js

const tsj = require("ts-json-schema-generator");
const fs = require("fs");

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const configs = [
    {
        path: "../models/compendium.ts",
        tsconfig: "./tsconfig.json",
        type: "CompendiumItemRenderer", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/compendium.schema.json"
    },
    {
        path: "../models/plugin.ts",
        tsconfig: "./tsconfig.json",
        type: "PluginManifest", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/manifest.schema.json"
    },
    {
        path: "../pages/compendium/renderers/ModularRenderer.tsx",
        tsconfig: "./tsconfig.json",
        type: "ModularRenderItem", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/modular.schema.json"
    }
];

for (let config of configs) {
    console.log(`Generating schema for ${config.path} :: ${config.type}`);
    const schema = tsj.createGenerator(config).createSchema(config.type);
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFile(config.output, schemaString, (err) => {
        if (err) throw err;
    });
    console.log(`Wrote schema to ${config.output}`);
}

