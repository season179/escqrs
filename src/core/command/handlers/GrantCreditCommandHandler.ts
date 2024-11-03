// src/core/command/handlers/GrantCreditCommandHandler.ts
import { injectable, inject } from "tsyringe";
import type { CommandHandler } from "../CommandHandler";
import type { GrantCreditCommand } from "../commands/GrantCreditCommand";
import { EarnWageAccountAggregate } from "../../domain/EarnWageAccountAggregate";
import type { EventStore } from "../../event/EventStore";
import type { EventBus } from "../../event/EventBus";
import { DomainError } from "../../errors/DomainError";

@injectable()
export class GrantCreditCommandHandler implements CommandHandler {
    constructor(
        @inject("EventStore") private eventStore: EventStore,
        @inject("EventBus") private eventBus: EventBus
    ) {}

    async handle(command: GrantCreditCommand): Promise<void> {
        if (command.payload.amount <= 0) {
            throw new DomainError("Credit amount must be positive");
        }

        const aggregate = new EarnWageAccountAggregate(command.payload.ebid);
        const events = await this.eventStore.getEvents(aggregate.getId());

        events.forEach((event) => aggregate.applyEvent(event));

        const newEvent = aggregate.grantCredit(command.payload.amount);
        await this.eventStore.save(newEvent);
        await this.eventBus.publish(newEvent);
    }
}
