import { useContext, useEffect } from "react";
import { UpdateContext } from "../App";

export type UpdateType = {
    event: string;
    data: { [key: string]: any } | null;
    dispatched: number;
};

/**
 * Adds callback to specific update type
 * @param callback Callback to call for each update
 * @param updateName update name to check for
 */
export function useUpdate(
    callback: (update: UpdateType) => void,
    updateName: string
) {
    const [update] = useContext(UpdateContext);

    useEffect(() => {
        if (update.active) {
            if (update.events.length > 0) {
                const results = update.pop(updateName);
                if (results.length > 0) {
                    results.map((v) => callback(v));
                }
            }
        }
    }, [update]);
}
