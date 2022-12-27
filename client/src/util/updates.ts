import { useContext, useEffect, useState } from "react";
import { UpdateContext } from "../App";

export type UpdateType = {
    event: string;
    body: { [key: string]: any } | null;
    dispatched: number;
};

export function useUpdate(updateName: string): {
    events: UpdateType[];
    clearEvents: () => void;
} {
    function clearEvents() {
        setResult({ events: [], clearEvents });
    }

    const [update] = useContext(UpdateContext);
    const [result, setResult] = useState<{
        events: UpdateType[];
        clearEvents: () => void;
    }>({
        events: [],
        clearEvents,
    });

    useEffect(() => {
        if (update.active) {
            if (update.events.length > 0) {
                const results = update.pop(updateName);
                if (results.length > 0) {
                    console.log(results);
                    const events = result.events;
                    events.unshift(...results);
                    setResult({ events, clearEvents });
                }
            }
        }
    }, [update]);

    return result;
}
