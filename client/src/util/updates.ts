import { useContext, useEffect, useState } from "react";
import { UpdateContext, UpdateContextType } from "../App";

export type UpdateType = {
    event: string;
    body: { [key: string]: any } | null;
};

export function useUpdate(
    updateName: string
): [UpdateType[], () => UpdateType | null] {
    const update = useContext(UpdateContext) as UpdateContextType;
    const [queue, setQueue] = useState<UpdateType[]>([]);

    const eventArray = update.active ? update.events : [];
    const popEvents = update.active ? update.pop : (type: string) => [];

    useEffect(() => console.log(update), [update]);

    useEffect(() => {
        if (eventArray.length > 0) {
            const results = popEvents(updateName);
            console.log(results);
            if (results.length > 0) {
                queue.unshift(...results);
                setQueue(queue);
            }
        }
    }, [eventArray]);

    return [
        queue,
        () => {
            const out = queue.pop();
            if (out) {
                setQueue(queue);
            }
            return out ?? null;
        },
    ];
}
