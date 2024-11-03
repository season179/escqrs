// src/core/command/handlers/ProcessReversalCommandHandler.ts
import type { CommandHandler } from "../CommandHandler";
import type { ProcessReversalCommand } from "../commands/ProcessReversalCommand";
import { EarnWageAccountAggregate } from "../../domain/EarnWageAccountAggregate";
import type { EventStore } from "../../event/EventStore";
import type { EventBus } from "../../event/EventBus";

export class ProcessReversalCommandHandler implements CommandHandler {
    constructor(
        private eventStore: EventStore,
        private eventBus: EventBus
    ) {}

    async handle(command: ProcessReversalCommand): Promise<void> {
        const aggregate = new EarnWageAccountAggregate(command.payload.ebid);
        const events = await this.eventStore.getEvents(aggregate.getId());

        events.forEach((event) => aggregate.applyEvent(event));

        const newEvent = aggregate.processReversal(
            command.payload.transactionId,
            command.payload.amount
        );

        await this.eventStore.save(newEvent);
        await this.eventBus.publish(newEvent);
    }
}
