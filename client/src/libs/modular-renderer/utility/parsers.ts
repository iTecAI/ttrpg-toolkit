import {
    GeneratorSourceItem,
    ListSourceItem,
    ParsedFunction,
    RawData,
    ValueItem,
    ValueStringDirective,
    ValueStringDirectiveNames,
    FormData,
} from "../types";
import { isArray, isLiteral } from "../types/guards";

export function parseFunctionCode(code: string | string[]): Function {
    let formattedFunction: string;
    if (isArray(code)) {
        formattedFunction = code.map((line) => line.trim()).join("");
    } else {
        formattedFunction = code.trim();
    }
    formattedFunction = formattedFunction.replace(/;$/g, "");
    return new Function(
        "options",
        `"use strict"; return (${formattedFunction})(options)`
    );
}

export function parseFunction(
    func: ParsedFunction,
    data: RawData,
    formData: FormData
): any {
    const parsedOptions: { [key: string]: any } = {};
    for (let k of Object.keys(func.opts)) {
        parsedOptions[k] = parseValueItem(func.opts[k], data, formData).result;
    }
    const fn = parseFunctionCode(func.function);
    return fn(parsedOptions);
}

export function parseNested(
    obj: any,
    keys: string | string[],
    new_val?: any
): any {
    if (typeof keys === "string") {
        keys = keys.split(".");
    }

    const key: string = keys[0];
    keys = keys.slice(1);
    try {
        if (Object.keys(obj).includes(key)) {
            if (keys.length === 0) {
                if (new_val !== undefined) {
                    obj[key] = new_val;
                }
                return obj[key];
            }
            return parseNested(obj[key], keys, new_val);
        } else {
            if (new_val !== undefined) {
                obj[key] = {};
                return parseNested(obj[key], keys, new_val);
            }
            /*console.warn(
                `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
            );*/
            return null;
        }
    } catch {
        if (new_val !== undefined) {
            obj[key] = {};
            return parseNested(obj[key], keys, new_val);
        }
        /*console.warn(
                `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
            );*/
        return null;
    }
}

export function parseListSourceItem(item: ListSourceItem, data: RawData): any[] {
    const src: any = parseNested(data, item.source);

    if (!isArray(src)) {
        console.warn(
            `Item at ${item.source} in ${JSON.stringify(data)} is not an array.`
        );
        return [];
    }
    return src;
}

export function parseGeneratorSourceItem(
    item: GeneratorSourceItem,
    data: RawData,
    formData: FormData
): any[] {
    const result = parseFunction(item.function, data, formData);
    if (!isArray(result)) {
        console.warn(
            `Function ${item.function.function.toString()} does not produce an array.`
        );
        return [];
    }
    return result;
}

type ValueItemOutput = {
    result: any;
    form_dependencies: string[];
};

/**
 * Parse a ValueItem. Likely will be the most useful in render functions.
 * @param item ValueItem to parse. Can be a literal, a "$directive:data" string, or a Text/Functional/DataItem
 * @returns The value retrieved/created
 */
export function parseValueItem(
    item: ValueItem,
    data: any,
    formData?: FormData
): ValueItemOutput {
    if (formData === undefined) {
        formData = {};
    }
    const OUTPUT: ValueItemOutput = {
        result: null,
        form_dependencies: [],
    };
    if (typeof item === "string") {
        if (item.startsWith("$")) {
            const directiveRaw: string = item.split(":")[0].split("$")[1];
            let directive: ValueStringDirective;
            if (ValueStringDirectiveNames.includes(directiveRaw)) {
                directive = directiveRaw as ValueStringDirective;
            } else {
                throw new Error(`Directive ${directiveRaw} not recognized.`);
            }
            const path = item.split(":")[1];

            switch (directive) {
                case "data":
                    try {
                        const out = parseNested(data, path);
                        if (out === undefined) {
                            OUTPUT.result =
                                item.split(":").length > 2
                                    ? parseValueItem(
                                          item.split(":")[2],
                                          data,
                                          formData
                                      ).result
                                    : null;
                            break;
                        }
                        OUTPUT.result = out;
                        break;
                    } catch {
                        OUTPUT.result =
                            item.split(":").length > 2
                                ? parseValueItem(
                                      item.split(":")[2],
                                      data,
                                      formData
                                  ).result
                                : null;
                        break;
                    }
                case "self":
                    OUTPUT.result = data;
                    break;
                case "form":
                    try {
                        const out = parseNested(formData, path);
                        if (out === undefined) {
                            OUTPUT.result =
                                item.split(":").length > 2
                                    ? parseValueItem(
                                          item.split(":")[2],
                                          data,
                                          formData
                                      ).result
                                    : null;
                            break;
                        }
                        OUTPUT.result = out;
                        OUTPUT.form_dependencies.push(path);
                        break;
                    } catch {
                        OUTPUT.result =
                            item.split(":").length > 2
                                ? parseValueItem(
                                      item.split(":")[2],
                                      data,
                                      formData
                                  ).result
                                : null;
                        break;
                    }
                default:
                    throw new Error(`Unknown directive "${directive}"`);
            }
        } else {
            OUTPUT.result = item;
        }
    } else if (isLiteral(item)) {
        OUTPUT.result = item;
    } else {
        switch (item.type) {
            case "data":
                try {
                    const out = parseNested(data, item.source);
                    if (out === undefined) {
                        OUTPUT.result = item.default
                            ? parseValueItem(item.default, data, formData)
                                  .result
                            : null;
                        break;
                    }
                    OUTPUT.result = out;
                    break;
                } catch {
                    OUTPUT.result = item.default
                        ? parseValueItem(item.default, data, formData).result
                        : null;
                    break;
                }
            case "text":
                let subbedText: string = item.content + "";
                for (let k of Object.keys(item.substitutions)) {
                    let sub = parseValueItem(
                        item.substitutions[k],
                        data,
                        formData
                    ).result;
                    subbedText = subbedText.replaceAll(
                        `{{${k}}}`,
                        (sub || "[NO VALUE]").toString()
                    );
                }
                OUTPUT.result = subbedText;
                break;
            case "function":
                const executor = parseFunctionCode(item.function);

                const parsedOptions: { [key: string]: any } = {};
                for (let k of Object.keys(item.opts)) {
                    parsedOptions[k] = parseValueItem(
                        item.opts[k],
                        data,
                        formData
                    ).result;
                }

                OUTPUT.result = executor(parsedOptions);
                break;
            case "form-data":
                try {
                    const out = parseNested(data, item.path);
                    if (out === undefined) {
                        OUTPUT.result = item.default
                            ? parseValueItem(item.default, data, formData)
                                  .result
                            : null;
                        break;
                    }
                    OUTPUT.result = out;
                    OUTPUT.form_dependencies.push(item.path);
                    break;
                } catch {
                    OUTPUT.result = item.default
                        ? parseValueItem(item.default, data, formData).result
                        : null;
                    break;
                }
        }
    }
    return OUTPUT;
}
