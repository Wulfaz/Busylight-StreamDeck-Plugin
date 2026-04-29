import {
    action,
    KeyAction,
    KeyUpEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
} from "@elgato/streamdeck";

const BUSYLIGHT_HOST = "http://localhost:8989";

interface BusylightPresencePayload {
    runningcommand: {
        parameter: string | null;
    };
}

interface BusylightCommandParameters {
    action?: string;
    green?: number;
    red?: number;
}

@action({ UUID: "net.wulfaz.busylight.toggle" })
export class ToggleBusylightAction extends SingletonAction {
    private readonly watchers = new Map<string, BusylightWatcher>();

    override async onWillAppear(ev: WillAppearEvent): Promise<void> {
        if (!ev.payload.isInMultiAction && ev.action.isKey()) {
            this.watchers.set(ev.action.id, new BusylightWatcher(ev.action));
        }
    }

    override onWillDisappear(ev: WillDisappearEvent): void {
        const watcher = this.watchers.get(ev.action.id);
        if (watcher) {
            watcher.stop();
            this.watchers.delete(ev.action.id);
        }
    }

    override async onKeyUp(ev: KeyUpEvent): Promise<void> {
        let desiredState: number;
        if (ev.payload.isInMultiAction) {
            desiredState = ev.payload.userDesiredState;
        } else {
            desiredState = ((ev.payload.state ?? 0) + 1) % 2;
        }

        const params = desiredState === 0 ? "action=light&green=50" : "action=pulse&red=100";
        await fetch(`${BUSYLIGHT_HOST}?${params}`);

        for (const [id, watcher] of this.watchers) {
            await watcher.refresh(desiredState, id === ev.action.id);
        }
    }

    refreshAllWatchers(): void {
        for (const watcher of this.watchers.values()) {
            watcher.refresh();
        }
    }
}

class BusylightWatcher {
    private timer: number | null = null;

    constructor(private readonly sdAction: KeyAction) {
        this.start();
    }

    private start(): void {
        if (this.timer !== null) return;
        this.refresh();
        this.timer = setInterval(() => this.refresh(), 5000);
    }

    stop(): void {
        if (this.timer === null) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    async refresh(knownState?: number, userInitiated = false): Promise<void> {
        try {
            const newState = knownState !== undefined ? knownState : await this.fetchCurrentState();
            if (newState === null || newState === undefined) return;

            await this.sdAction.setTitle("");
            await this.sdAction.setState(newState);
            if (userInitiated) {
                await this.sdAction.showOk();
            }
        } catch {
            await this.sdAction.setTitle("NOT INSTALLED");
            await this.sdAction.showAlert();
        }
    }

    private async fetchCurrentState(): Promise<number | undefined | null> {
        const resp = await fetch(`${BUSYLIGHT_HOST}?action=currentpresence`);
        if (resp.status !== 200) {
            await this.sdAction.setTitle(`${resp.status}`);
            await this.sdAction.showAlert();
            return null;
        }

        const payload = await resp.json() as BusylightPresencePayload;
        const parameter = payload.runningcommand.parameter;
        await this.sdAction.setTitle("");

        if (parameter === null) return undefined;

        const cmd = JSON.parse(parameter) as BusylightCommandParameters;
        if (cmd.action === "light" || cmd.action === "pulse") {
            if (cmd.green !== undefined && cmd.green > 0) return 0;
            if (cmd.red !== undefined && cmd.red > 0) return 1;
        }

        return undefined;
    }
}
