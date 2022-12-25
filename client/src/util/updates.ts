import { ApiResponse, get } from "./api";

export type UpdateType = {
    event: string;
    body: { [key: string]: any } | null;
};

export class Updates {
    private events: UpdateType[];
    public waiting_events: number;
    private retry: number;
    constructor(private session: string) {
        this.events = [];
        this.waiting_events = 0;
        this.retry = 0;
        this.run();
    }

    private async run() {
        let result: ApiResponse<UpdateType>;
        while (true) {
            result = await get<UpdateType>("/updates/poll");
            if (result.success) {
                console.log(result.value);
            } else {
                console.warn(
                    `Polling error ${result.statusCode}: ${result.debugMessage}. Waiting ${this.retry}s for retry.`
                );
                setTimeout(this.run, this.retry * 1000);
                this.retry += 5;
                break;
            }
        }
    }
}

export type UpdateManager = {
    updates: Updates | null;
    activate: (session: string) => void;
};
