import { RenderText, VariableItem } from "../../../models/compendium";

const stringVariableRegex = /{{.*?}}/g;

export function dynamicFunction(
    code: string | string[],
    options: { [key: string]: any }
) {
    if (typeof code !== "string") {
        code = (code as string[]).join("").replaceAll("\n", "").trim();
        if (code.endsWith(";")) {
            code = code.slice(0, -1);
        }
    }

    // eslint-disable-next-line
    const func = new Function(
        "options",
        `"use strict";return (${code})(options)`
    );
    return func(options);
}

export function parseOptionsDynamicFunction(
    code: string | string[],
    options: { [key: string]: string },
    data: { [key: string]: any }
) {
    let processedVars: { [key: string]: any } = {};
    for (let v of Object.keys(options)) {
        processedVars[v] = getNested(data, options[v]);
    }

    return dynamicFunction(code, processedVars);
}

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
        return parseOptionsDynamicFunction(item.function, item.options, data);
    }
}

export function renderText(
    data: { [key: string]: any },
    renderText: RenderText
) {
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
