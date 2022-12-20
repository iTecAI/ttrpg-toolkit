import { useState, useEffect, useContext, useMemo } from "react";
import { ValueItem } from "../types";
import {
    DocumentContext,
    buildStaticContext,
    useSubscribe,
} from "./document_communication";
import { parseValueItem } from "./parsers";
import { matchArrays } from "./arraymatch";

/**
 * Hook wrapper around parseValueItem to add functionality for fetching form data
 * @param item ValueItem to parse
 * @param dataOverride (Optional) Data to use instead of data from DocumentContext
 * @returns A result, which will update as necessary.
 */
export function useValueItem(item: ValueItem, dataOverride?: any): any {
    const context = useContext(DocumentContext);
    const staticContext = buildStaticContext(context);

    let data: any;
    if (dataOverride === undefined) {
        data = context ? context.data : {};
    } else {
        data = dataOverride;
    }

    const [deps, setDeps] = useState<string[]>([]);
    const updates = useSubscribe(deps);
    const [result, setResult] = useState<any>(
        parseValueItem(item, data, updates).result
    );

    useEffect(() => {
        const out = parseValueItem(
            item,
            data,
            context ? context.values : undefined
        );
        const _deps = out.form_dependencies;
        if (!matchArrays(_deps, deps)) {
            setDeps(_deps);
        }
        const _result = out.result;
        if (_result !== result) {
            setResult(_result);
        }
    }, [item, data, staticContext.values, context]);
    useMemo(() => {
        setDeps(
            parseValueItem(item, data, context ? context.values : undefined)
                .form_dependencies
        );
    }, []);
    if (context === null) {
        //console.warn(`Cannot use ValueItem : Document is NULL`);
        return "";
    }
    return result;
}
