// src/core/monitoring/Metrics.ts
import { injectable } from "tsyringe";
import prometheus from "prom-client";

@injectable()
export class Metrics {
    private readonly registry: prometheus.Registry;
    private readonly commandCounter: prometheus.Counter;
    private readonly queryCounter: prometheus.Counter;
    private readonly eventCounter: prometheus.Counter;
    private readonly operationDuration: prometheus.Histogram;

    constructor() {
        this.registry = new prometheus.Registry();

        this.commandCounter = new prometheus.Counter({
            name: "earnwage_commands_total",
            help: "Total number of commands processed",
            labelNames: ["type", "status"],
        });

        this.queryCounter = new prometheus.Counter({
            name: "earnwage_queries_total",
            help: "Total number of queries processed",
            labelNames: ["type"],
        });

        this.eventCounter = new prometheus.Counter({
            name: "earnwage_events_total",
            help: "Total number of events processed",
            labelNames: ["type"],
        });

        this.operationDuration = new prometheus.Histogram({
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
