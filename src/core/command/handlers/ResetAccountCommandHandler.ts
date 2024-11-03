// src/core/command/handlers/ResetAccountCommandHandler.ts
import type { CommandHandler } from "../CommandHandler";
import type { ResetAccountCommand } from "../commands/ResetAccountCommand";
import { EarnWageAccountAggregate } from "../../domain/EarnWageAccountAggregate";
import type { EventStore } from "../../event/EventStore";
import type { EventBus } from "../../event/EventBus";

export class ResetAccountCommandHandler implements CommandHandler {
    constructor(
        private eventStore: EventStore,
        private eventBus: EventBus
    ) {}

    async handle(command: ResetAccountCommand): Promise<void> {
        const aggregate = new EarnWageAccountAggregate(command.payload.ebid);
        const events = await this.eventStore.getEvents(aggregate.getId());

        events.forEach((event) => aggregate.applyEvent(event));

        const newEvent = aggregate.resetAccount();

        await this.eventStore.save(newEvent);
        await this.eventBus.publish(newEvent);
    }
}
