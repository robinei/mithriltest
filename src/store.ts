
export class Store<T> {
    private readonly subscribers: (() => void)[] = [];

    constructor(private state: T, private postModifyHandler: () => void) {}

    getState = (): T => {
        return this.state;
    }

    modify = (f: (state: T) => T) => {
        this.state = f(this.state);
        for (const sub of this.subscribers) {
            sub();
        }
        if (this.postModifyHandler) {
            this.postModifyHandler();
        }
    }

    subscribe = (sub: () => void) => {
        const index = this.subscribers.indexOf(sub);
        if (index < 0) {
            this.subscribers.push(sub);
        }
    }

    unsubscribe = (sub: () => void) => {
        const index = this.subscribers.indexOf(sub);
        if (index >= 0) {
            this.subscribers.splice(index, 1);
        }
    }
}
