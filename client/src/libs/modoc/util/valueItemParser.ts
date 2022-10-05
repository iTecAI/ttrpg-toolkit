import {
    FormSpec,
    ValueItem,
    ValueStringDirective,
    ValueStringDirectiveNames,
} from "../types";
import { isLiteral } from "../types/guards";
import parseFunction from "./functionParser";
import parseNested from "./nestedParser";

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
    formData: FormSpec
): ValueItemOutput {
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
                const executor = parseFunction(item.function);

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

export function parseValueItemNoForm(item: ValueItem, data: any): any {
    return parseValueItem(item, data, {}).result;
}
