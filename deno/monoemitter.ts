// deno-lint-ignore-file no-explicit-any

/**
 * Listener type for the mono emitter
 */
export type MonoListener<T extends any[]> = (...args: T) => any;

/**
 * Same as eventemitter class but acts as an emitter for one single event!
 */
export class MonoEmitter<T extends any[] = any[]> {

    #listeners: MonoListener<T>[] = [];
    maxListenersCount?: number;

    /**
     * Adds an event listener
     * 
     * @param listeners The listeners to add
     * @example events.addListener(() => console.log("I am emitted!"));
     */
    addListener(...listeners: MonoListener<T>[]): void {
        if(this.maxListenersCount && (this.maxListenersCount < (this.listenersCount + 1))) throw new TypeError(`Maximum listeners reached for the mono emitter! Maximum count: ${this.maxListenersCount}`);
        this.#listeners.push(...listeners);
    }

    /**
     * Adds an event listener
     * 
     * @param listeners The listeners to add
     * @example events.on(() => console.log("I am emitted!"));
     */
    on(...listeners: MonoListener<T>[]): void {
        this.addListener(...listeners);
    }

    /**
     * Add an event listener and emits it for once and gets removed!
     * 
     * @param listeners The callbacks to add as a listener
     * @example events.once((e) => console.log(e));
     */
    async once(...listeners: MonoListener<T>[]): Promise<void> {
        const args = await this.wait();
        await Promise.all(listeners.map(x => x(...args)));
    }

    /**
     * Removes an event listener
     * 
     * @param listener The listener to remove
     * @example events.removeListener(callback);
     */
    removeListener(listener: MonoListener<T>): void {
        this.#listeners = this.#listeners.filter(x => x != listener);
    }

    /**
     * Emits an event
     * 
     * @param args The args to send as payload
     * @example events.emit();
     */
    emit<R = unknown>(...args: T): Promise<R[]> {
        return Promise.all(this.#listeners.map(x => x(...args)));
    }

    /**
     * Similar to emit but this method would do it in sync and does not waits for the listeners to return the value.
     * 
     * @param args The args to send as payload
     * @example events.emitSync();
     */
    emitSync<R = unknown>(...args: T): R[] {
        return this.#listeners.map(x => x(...args));
    }

    /**
     * Returns all the listeners
     * @readonly
     */
    get listeners() {
        return this.#listeners;
    }

    /**
     * Returns the length of the listeners
     * @readonly
     */
    get listenersCount() {
        return this.#listeners.length;
    }

    /**
     * Await and get event arguments once!
     * @example const args = await events.wait();
     */
    wait(timeout?: number): Promise<T> {
        let fullfilled = false;

        const promise = new Promise<T>((resolve) => {
            const callback = ((...args: any) => {
                this.#listeners = this.#listeners.filter(x => x != callback);
                resolve(args);
                fullfilled = true;
            }) as MonoListener<T>;

            this.#listeners.push(callback);
            if(timeout) setTimeout(() => {
                if(!fullfilled) throw new Error('Maximum timeout exceeded waiting for an event emission!');
            }, timeout);
        });

        return promise;
    }

    /**
     * Clears all event listeners
     */
    clear(): void {
        this.#listeners = [];
    }

    /**
     * Returns an async iterator which iterates instead of using addListener!
     * 
     * @example
     * for await (const args of events.iterator()) {
     *     console.log("Event emitted with args: " + args);
     * }
     */
    async * iterator(): AsyncIterableIterator<T> {
        while(true) { yield await this.wait() }
    }

}