import express from "express";
import { SubscriptionManager } from "../subscription/SubscriptionManager";

export function createSSEServer(subscriptionManager: SubscriptionManager) {
    const app = express();

    app.get("/subscribe/:eventType", (req, res) => {
        const eventType = req.params.eventType;

        // Set headers for SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const onData = (data: any) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Subscribe to the event
        subscriptionManager.subscribe(eventType, onData);

        // Handle client disconnect
        req.on("close", () => {
            subscriptionManager.unsubscribe(eventType, onData);
        });
    });

    return app;
}
