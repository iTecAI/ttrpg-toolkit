import { useState, useEffect, useContext } from "react";
import { ValueItem } from "../types";
import {
    DocumentContext,
    buildStaticContext,
    useSubscribe,
} from "./document_communication";
import { parseValueItem } from "./parsers";

export function useValueItem(item: ValueItem, dataOverride?: any): any {
    const context = useContext(DocumentContext);
    const staticContext = buildStaticContext(context);

    let data: any;
    if (dataOverride === undefined) {
        data = context ? context.data : {};
    } else {
        data = dataOverride;
    }

    const [deps, setDeps] = useState<string[]>(
        parseValueItem(item, data, context ? context.values : undefined)
            .form_dependencies
    );
    const updates = useSubscribe(deps);
    const [result, setResult] = useState<any>(
        parseValueItem(item, data, updates).result
    );
    useEffect(
        () =>
            setDeps(
                parseValueItem(item, data, context ? context.values : undefined)
                    .form_dependencies
            ),
        [item, data, staticContext.values, context]
    );
    useEffect(
        () => setResult(parseValueItem(item, data, updates).result),
        [item, data, updates]
    );
    if (context === null) {
        console.warn(`Cannot use ValueItem : Document is NULL`);
        return;
    }
    return result;
}
