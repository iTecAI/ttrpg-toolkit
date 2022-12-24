export type UpdateType = {
    event: string;
    data: { [key: string]: any };
    dispatched: number;
};

export class Updates {
    private source: EventSource;
    private events: UpdateType[];
    public waiting_events: number;
    constructor(private session: string) {
        this.source = new EventSource(`/api/updates/subscribe/${session}`);
        this.events = [];
        this.waiting_events = 0;

        this.source.addEventListener("open", console.log);
        this.source.addEventListener("update", console.log);
    }
}

export type UpdateManager = {
    updates: Updates | null;
    activate: (session: string) => void;
};
