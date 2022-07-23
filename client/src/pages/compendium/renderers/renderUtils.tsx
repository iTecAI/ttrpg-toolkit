import { DataItem, RenderText, VariableItem } from "../../../models/compendium";

const stringVariableRegex = /{{.*?}}/g;

export function getNested(obj: any, key: string | string[]): any {
    if (typeof key === "string") {
        key = key.split(".");
    }

    for (let k of key) {
        obj = obj[k];
        if (obj === undefined || obj === null) {
            return obj;
        }
    }

    return obj;
}

function parseVariableString(
    text: string,
    vars: { [key: string]: any }
): string {
    const stringVars = text.match(stringVariableRegex);
    if (!stringVars) {
        return text;
    }

    for (let v of stringVars) {
        let varName = v.slice(2, -2);
        let resolvedValue = getNested(vars, varName);
        if (resolvedValue !== undefined) {
            text = text.replace(v, resolvedValue);
        }
    }

    return text;
}

function parseVariableItem(
    item: VariableItem,
    data: { [key: string]: any }
): any {
    if (item.type === "text") {
        return getNested(data, item.source);
    } else {
        let processedVars: { [key: string]: any } = {};
        for (let v of Object.keys(item.options)) {
            processedVars[v] = getNested(data, item.options[v]);
        }

        const func = new Function(
            "options",
            `"use strict";return (${item.function})(options)`
        );
        return func(processedVars);
    }
}

export function renderText(data: DataItem, renderText: RenderText) {
    if (typeof renderText === "string") {
        return parseVariableString(renderText, data);
    }

    let processedVars: { [key: string]: any } = {};
    for (let v of Object.keys(renderText.vars)) {
        if (typeof renderText.vars[v] === "string") {
            processedVars[v] = getNested(data, renderText.vars[v] as string);
        } else {
            processedVars[v] = parseVariableItem(
                renderText.vars[v] as VariableItem,
                data
            );
        }
    }

    return parseVariableString(renderText.text, processedVars);
}
