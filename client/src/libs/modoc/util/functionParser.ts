import { isArray } from "../types/guards";

export default function parseFunction(code: string | string[]): Function {
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
