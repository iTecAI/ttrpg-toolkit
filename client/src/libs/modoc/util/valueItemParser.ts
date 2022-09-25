import {
    ValueItem,
    ValueStringDirective,
    ValueStringDirectiveNames,
} from "../types";
import { isLiteral } from "../types/guards";
import parseFunction from "./functionParser";
import parseNested from "./nestedParser";

/**
 * Parse a ValueItem. Likely will be the most useful in render functions.
 * @param item ValueItem to parse. Can be a literal, a "$directive:data" string, or a Text/Functional/DataItem
 * @returns The value retrieved/created
 */
export function parseValueItem(item: ValueItem, data: any): any {
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
                    return parseNested(data, path);
                case "self":
                    return data;
                default:
                    throw new Error(`Unknown directive "${directive}"`);
            }
        } else {
            return item;
        }
    } else if (isLiteral(item)) {
        return item;
    } else {
        switch (item.type) {
            case "data":
                return parseNested(data, item.source);
            case "text":
                let subbedText: string = item.content + "";
                for (let k of Object.keys(item.substitutions)) {
                    let sub = parseValueItem(item.substitutions[k], data);
                    subbedText = subbedText.replaceAll(
                        `{{${k}}}`,
                        sub.toString()
                    );
                }
                return subbedText;
            case "function":
                const executor = parseFunction(item.function);

                const parsedOptions: { [key: string]: any } = {};
                for (let k of Object.keys(item.opts)) {
                    parsedOptions[k] = parseValueItem(item.opts[k], data);
                }

                return executor(parsedOptions);
        }
    }
}
