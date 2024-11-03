// src/core/event/EventHandler.ts
import type { Event } from "./Event";

export interface EventHandler {
    handle(event: Event): Promise<void>;
}
