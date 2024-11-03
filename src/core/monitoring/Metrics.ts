// src/core/monitoring/Metrics.ts
import { Registry, Counter, Histogram } from "prom-client";

export class Metrics {
    private readonly registry: Registry;
    private readonly commandCounter: Counter;
    private readonly queryCounter: Counter;
    private readonly eventCounter: Counter;
    private readonly operationDuration: Histogram;

    constructor() {
        this.registry = new Registry();

        this.commandCounter = new Counter({
            name: "earnwage_commands_total",
            help: "Total number of commands processed",
            labelNames: ["type", "status"],
        });

        this.queryCounter = new Counter({
            name: "earnwage_queries_total",
            help: "Total number of queries processed",
            labelNames: ["type"],
        });

        this.eventCounter = new Counter({
            name: "earnwage_events_total",
            help: "Total number of events processed",
            labelNames: ["type"],
        });

        this.operationDuration = new Histogram({
            name: "earnwage_operation_duration_seconds",
            help: "Duration of operations",
            labelNames: ["operation"],
            buckets: [0.1, 0.5, 1, 2, 5],
        });

        this.registry.registerMetric(this.commandCounter);
        this.registry.registerMetric(this.queryCounter);
        this.registry.registerMetric(this.eventCounter);
        this.registry.registerMetric(this.operationDuration);
    }

    incrementCommand(type: string, status: "success" | "failure"): void {
        this.commandCounter.labels(type, status).inc();
    }

    incrementQuery(type: string): void {
        this.queryCounter.labels(type).inc();
    }

    incrementEvent(type: string): void {
        this.eventCounter.labels(type).inc();
    }

    async measureOperationDuration<T>(
        operation: string,
        func: () => Promise<T>
    ): Promise<T> {
        const end = this.operationDuration.labels(operation).startTimer();
        try {
            return await func();
        } finally {
            end();
        }
    }

    getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
