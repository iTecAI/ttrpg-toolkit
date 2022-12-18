import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { ValueItem } from "../types";
import { DocumentContext, useSubscribe } from "./document_communication";
import { parseValueItem } from "./parsers";

export function useValueItem(item: ValueItem): any {
    const context = useContext(DocumentContext);
    if (context == null) {
        console.warn(`Cannot use ValueItem : Document is NULL`);
        return;
    }

    const [deps, setDeps] = useState<string[]>(
        parseValueItem(item, context.data, context.values).form_dependencies
    );
    const updates = useSubscribe(deps);
    const [result, setResult] = useState<any>(
        parseValueItem(item, context.data, updates).result
    );
    useEffect(
        () =>
            setDeps(
                parseValueItem(item, context.data, context.values)
                    .form_dependencies
            ),
        [item, context.data, context.values]
    );
    useEffect(
        () => setResult(parseValueItem(item, context.data, updates).result),
        [item, context.data, updates]
    );
    return result;
}
