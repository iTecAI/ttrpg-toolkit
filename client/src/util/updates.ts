import { useContext, useEffect, useState } from "react";
import { UpdateContext } from "../App";

export type UpdateType = {
    event: string;
    body: { [key: string]: any } | null;
    dispatched: number;
};

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
