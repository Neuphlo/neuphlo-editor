import { createStore } from "jotai";

// biome-ignore lint/suspicious/noExplicitAny: store is opaque to consumers
export const novelStore: any = createStore();
export * from "jotai";

