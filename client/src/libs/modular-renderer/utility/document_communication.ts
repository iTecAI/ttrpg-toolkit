import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { ModularDocument } from "../types";

// Context for Documents
export const DocumentContext = React.createContext<ModularDocument | null>(
    null
);

export function buildStaticContext(
    context: ModularDocument | undefined | null
) {
    return {
        documentId: context && context.documentId,
        update: context && context.update,
        values: context && context.values,
        data: context && context.data,
    };
}

/**
 * Hook to update a field with a value
 * @param fieldName Field ID to update
 * @param fieldValue Value to pass
 */
export function useUpdateField(fieldName: string | undefined, fieldValue: any) {
    const context = useContext(DocumentContext);
    const staticContext = buildStaticContext(context);
    useEffect(() => {
        if (fieldName !== undefined && context) {
            if (context.values[fieldName] !== fieldValue) {
                context.update(fieldName, fieldValue);
            }
        }
    }, [fieldName, fieldValue, staticContext.update, context]);
    if (context === null) {
        /*console.warn(
            `Cannot update field ${fieldName} with value ${fieldValue} : Document is NULL`
        );*/
        return;
    }
}

/**
 * Hook to subscribe to field(s) and return a mapping of field ID : field value
 * @param fields Field IDs to subscribe to
 * @returns Object of {fieldId: fieldValue, ...}
 */
export function useSubscribe(fields: string[]): { [key: string]: any } {
    const context = useContext(DocumentContext);
    const [out, setOut] = useState<{ [key: string]: any }>({});
    const staticContext = buildStaticContext(context);
    useEffect(() => {
        if (!fields) {
            return;
        }
        const tmp: { [key: string]: any } = {};
        for (let f of fields) {
            tmp[f] = (staticContext.values && staticContext.values[f]) ?? null;
        }
        if (JSON.stringify(tmp) != JSON.stringify(out)) {
            setOut(tmp);
        }
    }, [staticContext.values, fields]);
    if (context == null) {
        /*console.warn(
            `Cannot fetch fields [${fields.join(", ")}] : Document is NULL`
        );*/
        return {};
    }

    return out;
}
