// deno-lint-ignore-file no-explicit-any ban-ts-comment

/**
 * The basic default event map for the event emitter
 */
export type DefaultEventMap = Record<string | number | symbol, (...args: any) => any>;

/**
 * Forms an listener type by the event map provided!
 */
export type ListenerArgs<T extends DefaultEventMap, EK extends keyof T = keyof T> = Parameters<T[EK]>;

/**
 * The main event emitter class
 */
export class EventEmitter<T extends DefaultEventMap = DefaultEventMap> {

    #events = new Map<keyof T, (T[keyof T])[]>();
    #maxListeners = new Map<keyof T, number>();

    /**
     * Add an event listener 
     * 
     * @param event The event name to add
     * @param listeners The callbacks to add as a listener
     * @example events.addListener("eventName", (e) => console.log(e));
     */
    addListener(event: keyof T, ...listeners: (T[typeof event])[]): void {
        // @ts-ignore
        const maxCount = this.#maxListeners.get(event) + 1;
        if(maxCount && ((this.listenerCount(event) + 1) > maxCount)) throw new TypeError(`Maximum listeners reached for the event ${event}! Maximum count: ${maxCount}`);
        const evt = this.#events.get(event);
        this.#events.set(event, evt ? [...listeners, ...evt] : listeners);
    }

    /**
     * Add an event listener 
     * 
     * @param event The event name to add
     * @param listeners The callbacks to add as a listener
     * @example events.on("eventName", (e) => console.log(e));
     */
    on(event: keyof T, ...listeners: (T[typeof event])[]): void {
        this.addListener(event, ...listeners);
    }

    /**
     * Add an event listener and emits it for once and gets removed!
     * 
     * @param event The event name to add
     * @param listeners The callbacks to add as a listener
     * @example events.once("eventName", (e) => console.log(e));
     */
    async once(event: keyof T, ...listeners: (T[typeof event])[]): Promise<void> {
        const args = await this.wait(event);
        await Promise.all(listeners.map(x => x(...args as any[])));
    }

    /**
     * Remove an event listener 
     * 
     * @param event The event name to rename
     * @param listener The callback to rename as a listener
     * @example events.removeListener("eventName", func);
     */
    removeListener(event: keyof T, listener: T[typeof event]): void {
        this.#events.set(event, this.#events.get(event)?.filter(x => x != listener) || []);
    }

    /**
     * Removed all event listeners
     * 
     * @param event The event name
     * @example events.removeListeners("eventName");
     */
    removeListeners(event: keyof T): void {
        this.#events.delete(event);
    }

    /**
     * Clear all event listeners
     */
    clear(): void {
        this.#events.clear();
    }

    /**
     * Returns all the event listeners of the event
     * 
     * @param event The event name
     * @example const listener = events.getListeners("name");
     */
    getListeners(event: keyof T): (T[keyof T])[] {
        return this.#events.get(event) || [];
    }

    /**
     * Emits an event
     * 
     * @param event Event name
     * @param args The arguments to supply while emitting!
     * @example events.emit("eventName");
     */
    emit<R = unknown>(event: keyof T, ...args: ListenerArgs<T, typeof event>): Promise<R[]> {
        return Promise.all<R>(this.#events.get(event)?.map(x => x(...args as any[])) || [])
    }

    /**
     * Similar to emit but this method would do it in sync and does not waits for the listeners to return the value.
     * 
     * @param event Event name
     * @param args The arguments to supply while emitting!
     * @example events.emitSync("eventName");
     */
    emitSync<R = unknown>(event: keyof T, ...args: ListenerArgs<T, typeof event>): R[] {
        return this.#events.get(event)?.map(x => x(...args as any[])) || [];
    }

    /**
     * Await and get event arguments once!
     * 
     * @param event Event name
     * @example const args = await events.wait("eventName");
     */
    wait(event: keyof T, timeout?: number): Promise<ListenerArgs<T, typeof event>> {
        let fullfilled = false;

        const promise = new Promise<ListenerArgs<T, typeof event>>((resolve) => {
            const callback = ((...args: any) => {
                this.removeListener(event, callback);
                resolve(args);
                fullfilled = true;
            }) as T[keyof T];

            this.addListener(event, callback);
            if(timeout) setTimeout(() => {
                if(!fullfilled) throw new Error('Maximum timeout exceeded waiting for an event emission!');
            }, timeout);
        });

        return promise;
    }

    /**
     * Returns an async iterator which iterates instead of using addListener!
     * 
     * @param event The event name
     * @example
     * for await (const args of events.iterator("eventName")) {
     *     console.log("Event emitted with args: " + args);
     * }
     */
    async * iterator(event: keyof T): AsyncIterableIterator<ListenerArgs<T, typeof event>> {
        while(true) { yield await this.wait(event) }
    }

    /**
     * Returns the max listeners mapping!
     * @readonly
     */
    get maxListeners() {
        return this.#maxListeners;
    }

    /**
     * Returns the count of listeners!
     * 
     * @param event The event name
     * @example const count = events.listenerCount("eventName");
     */
    listenerCount(event: keyof T) {
        return this.getListeners(event)?.length;
    }
    
}
