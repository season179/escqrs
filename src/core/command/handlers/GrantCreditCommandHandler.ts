// src/core/command/handlers/GrantCreditCommandHandler.ts
import type { CommandHandler } from "../CommandHandler";
import type { GrantCreditCommand } from "../commands/GrantCreditCommand";
import { EarnWageAccountAggregate } from "../../domain/EarnWageAccountAggregate";
import type { EventStore } from "../../event/EventStore";
import type { EventBus } from "../../event/EventBus";
import { DomainError } from "../../errors/DomainError";

export class GrantCreditCommandHandler implements CommandHandler {
    constructor(private eventStore: EventStore, private eventBus: EventBus) {}

    async handle(command: GrantCreditCommand): Promise<void> {
        console.log("hello")
        const { uid, ebid, amount } = command.payload;

        if (!uid && !ebid) {
            throw new DomainError("Either uid or ebid must be provided");
        }

        const aggregate = new EarnWageAccountAggregate(uid || "", ebid);

        if (amount <= 0) {
            throw new DomainError("Credit amount must be positive");
        }

        const events = await this.eventStore.getEvents(aggregate.getId());

        events.forEach((event) => aggregate.applyEvent(event));

        const newEvent = aggregate.grantCredit(amount);
        await this.eventStore.save(newEvent);
        await this.eventBus.publish(newEvent);
    }
}
