import {
    GeneratorSourceItem,
    ListSourceItem,
    ParsedFunction,
    RawData,
    ValueItem,
    ValueStringDirective,
    ValueStringDirectiveNames,
    FormData,
    AllItems,
    AllRenderItems,
} from "../types";
import { isArray, isLiteral, isRenderItem } from "../types/guards";

/**
 * Parses function code from a ParsedFunction into a callable
 * @param code Code to parse, either as a string or array of strings
 * @returns Function of type (opts: {[key: string]: any}) => any
 */
export function parseFunctionCode(code: string | string[]): Function {
    let formattedFunction: string;
    if (isArray(code)) {
        formattedFunction = code.map((line) => line.trim()).join("");
    } else {
        formattedFunction = code.trim();
    }
    formattedFunction = formattedFunction.replace(/;$/g, "");
    // eslint-disable-next-line
    return new Function(
        "options",
        `"use strict"; return (${formattedFunction})(options)`
    );
}

/**
 * Parse a ParsedFunction object and return the output
 * @param func ParsedFunction object
 * @param data Data to use
 * @param formData FormData to use
 * @returns Function result, or "ERROR"
 */
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
    try {
        return fn(parsedOptions);
    } catch (e: any) {
        console.debug(
            `Error executing ${
                isArray(func.function)
                    ? func.function.join("\n")
                    : func.function
            } with options ${JSON.stringify(parsedOptions)}`,
            e
        );
        return "ERROR";
    }
}

/**
 * Parse a nested key (such as this.is.a.key.to.an.object), and may set a new value
 * @param obj Object to search
 * @param keys Key in form "this.is.a.key" or ["this", "is", "a", "key"]
 * @param new_val (Optional) New value to set
 * @returns 
 */
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

/**
 * Parse a ListSourceItem
 * @param item Item to parse
 * @param data Raw data
 * @returns Array of data objects
 */
export function parseListSourceItem(
    item: ListSourceItem,
    data: RawData
): any[] {
    const src: any = parseNested(data, item.source);

    if (!isArray(src)) {
        console.warn(
            `Item at ${item.source} in ${JSON.stringify(data)} is not an array.`
        );
        return [];
    }
    return src;
}

/**
 * Parse a GeneratorSourceItem
 * @param item Item to parse
 * @param data Data to use
 * @param formData FormData to use
 * @returns Array of data objects
 */
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
                        (sub ?? "[NO VALUE]").toString()
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

export type ExpandedRenderItem = { renderer: AllRenderItems; data: any };
export function expandItems(
    item: AllItems | AllItems[],
    data: any,
    formData: FormData
): ExpandedRenderItem[] {
    if (isArray(item)) {
        const out: ExpandedRenderItem[] = [];
        item.forEach((v) =>
            expandItems(v, data, formData).forEach((vv) => out.push(vv))
        );
        return out;
    }
    if (isRenderItem(item)) {
        if (item.conditionalRender) {
            if (
                parseFunction(item.conditionalRender, data, formData) === false
            ) {
                return [];
            }
        }
        return [{ renderer: item, data: data }];
    }
    switch (item.type) {
        case "generator":
            return parseGeneratorSourceItem(item, data, formData)
                .map((v) => {
                    if (item.renderer.conditionalRender) {
                        if (
                            parseFunction(
                                item.renderer.conditionalRender,
                                v,
                                formData
                            ) === false
                        ) {
                            return null;
                        }
                    }
                    return { renderer: item.renderer, data: v };
                })
                .filter((v) => v != null) as ExpandedRenderItem[];
        case "list":
            return parseListSourceItem(item, data)
                .map((v) => {
                    if (item.renderer.conditionalRender) {
                        if (
                            parseFunction(
                                item.renderer.conditionalRender,
                                v,
                                formData
                            ) === false
                        ) {
                            return null;
                        }
                    }
                    return { renderer: item.renderer, data: v };
                })
                .filter((v) => v != null) as ExpandedRenderItem[];
    }
}