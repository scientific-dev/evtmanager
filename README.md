# EvtManager

Simple and easy to use eventemitter to manage your events synchronously and asynchronously too for Deno, node and for the browser with a typesafe environment!

[![](https://www.codefactor.io/repository/github/scientific-guy/evtmanager/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/scientific-guy/evtmanager)
[![](https://img.shields.io/badge/VIEW-GITHUB-white?style=for-the-badge)](https://github.com/Scientific-Guy/evtmanager)
[![](https://img.shields.io/github/v/tag/Scientific-Guy/evtmanager?style=for-the-badge&label=version)](https://github.com/Scientific-Guy/evtmanager)

## Installation

### For deno

```ts
import { EventEmitter } from "https://raw.githubusercontent.com/Scientific-Guy/evtmanager/master/mod.ts";
```

### For node and browser

```sh
> npm i evtmanager
```

## Example

Evtmanager is same as the basic `events` package but with some additional utilities and typesafe environment!

```ts
import { EventEmitter } from "evtmanager";

interface EventMap{
    ready: () => void;
    start: () => void;
    destory: (reason?: string) => void;
    error: (reason?: string) => void;
}

const system = new EventEmitter<EventMap>();

system.on("ready", () => {
    console.log('System is ready!');
});

system.emit('ready');
```

Now here is an example of a typesafe environment

```ts
system.on("ready", () => {
    console.log('System is ready!');
}); // Will compile

system.on("ready", (ctx) => {
    console.log('System is ready!');
}); // Will not compile as it has a parameter ctx additional which is not supplied in the event map!
```

Here are some methods which you already might know!

```ts
const listener = () => console.log("System is ready");

system.addListener("ready", listener); // Adds an listener
system.on("ready", () => console.log("System is ready")); // Same as addListener method
system.once("ready", () => console.log("System is ready")); // Adds an listener which listens only one event

system.removeListener("ready", listener); // Removes a listener
system.removeListeners("ready"); // Removes all listeners registered on event "ready"
system.clear(); // Clears all event listeners

const listeners = system.getListeners("ready"); // Returns an array of listeners listening to the event
const count = system.listenerCount("ready"); // Returns number of listeners listening to the "ready" event

const responses = await system.emit("ready"); // Dispatches a event and runs all the listeners one by one awaiting it
const syncResponses = system.emitSync("ready"); // Dispatches a event and does not waits for listeners to return a value

system.maxListeners.set("ready", 5); // Set maximum listeners to 5 so only about 5 listeners can listen to the event!
system.maxListeners.delete("ready"); // Remove the limit
system.maxListeners.get("ready"); // Get limit
```

### Awaiting responses

Waiting events means it waits for the emitter for the event to be emitted and returns the args received!

```ts
const response = await system.wait("destroy");
console.log(`System finally destoryed with the reason as: ${response}`);
```

This is used for the once method. You can even set a timeout for it!

```ts
try{
    const response = await system.wait("destroy", 2000);
    console.log(`System finally destoryed with the reason as: ${response}`);
} catch {
    console.log(`Could not catch the event within 2 seconds!`);
}
```

### Iterating 

You can iterate asynchronously over an event like this
> This method is made as for some utility!

```ts
for await (const [reason] of system.iterator("error")) {
    console.log(`Found an error: ${reason}`);
}
```

## MonoEmitter

MonoEmitter is nothing but the same eventemitter but does not needs any event name to register! For example, view the code block given below:

```ts
import { MonoEmitter } from "evtmanager";

const system = new MonoEmitter();

system.on(() => {
    console.log('System is ready!');
});

system.emit();
```

It has almost the same methods 

```ts
const listener = () => console.log("I am emitted");

event.addListener(listener); // Adds an listener
event.on(() => console.log("I am emitted")); // Same as addListener method
event.once(() => console.log("I am emitted")); // Adds an listener which listens only one event

event.removeListener(listener); // Removes a listener
event.clear(); // Clears all event listeners

event.listeners; // Returns an array of listeners listening to the event
event.listenerCount; // Returns number of listeners listening to the "ready" event

const responses = await event.emit(); // Dispatches a event and runs all the listeners one by one awaiting it
const syncResponses = event.emitSync(); // Dispatches a event and does not waits for listeners to return a value

event.maxListenersCount = 5; // Set maximum listeners to 5 so only about 5 listeners can listen to the event!
delete event.maxListenersCount; // Remove the limit
```

And you can use the same utility methods to the `MonoEmitter` too!

```ts
try{
    const args = await event.wait(2000);
    console.log(args);
} catch {
    console.log(`Could not catch the event within 2 seconds!`);
}
```

```ts
for await (const args of event.iterator("error")) {
    console.log(`Caught a new event: `, args);
}
```