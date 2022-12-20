// main.js

const tsj = require("ts-json-schema-generator");
const fs = require("fs");

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const configs = [
    {
        path: "./src/libs/modular-renderer/types/index.ts",
        tsconfig: "./tsconfig.json",
        type: "AllItems", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/renderer.schema.json",
    },
    {
        path: "./src/models/plugin.ts",
        tsconfig: "./tsconfig.json",
        type: "PluginManifest", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/manifest.schema.json",
    },
    {
        path: "./src/models/compendium.ts",
        tsconfig: "./tsconfig.json",
        type: "CompendiumItem", // Or <type-name> if you want to generate schema for that one type only,
        output: "../schema/compendium.schema.json",
    },
];

for (let config of configs) {
    //console.log(`Generating schema for ${config.path} :: ${config.type}`);
    const schema = tsj.createGenerator(config).createSchema(config.type);
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFile(config.output, schemaString, (err) => {
        if (err) throw err;
    });
    //console.log(`Wrote schema to ${config.output}`);
}
