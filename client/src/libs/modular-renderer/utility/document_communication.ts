import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { ModularDocument } from "../types";

// Context for Documents
export const DocumentContext = React.createContext<ModularDocument | null>(
    null
);

/**
 * Hook to update a field with a value
 * @param fieldName Field ID to update
 * @param fieldValue Value to pass
 */
export function useUpdateField(fieldName: string, fieldValue: any) {
    const context = useContext(DocumentContext);
    if (context == null) {
        console.warn(
            `Cannot update field ${fieldName} with value ${fieldValue} : Document is NULL`
        );
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
    if (context == null) {
        console.warn(
            `Cannot fetch fields [${fields.join(", ")}] : Document is NULL`
        );
        return {};
    }
    useEffect(() => {
        const tmp: { [key: string]: any } = {};
        for (let f of fields) {
            tmp[f] = context.values[f] ?? null;
        }
        setOut(tmp);
    }, [context.values, fields]);
    return out;
}
