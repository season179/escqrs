// src/core/command/handlers/WithdrawCreditCommandHandler.ts
import { injectable, inject } from "tsyringe";
import type { CommandHandler } from "../CommandHandler";
import type { WithdrawCreditCommand } from "../commands/WithdrawCreditCommand";
import { EarnWageAccountAggregate } from "../../domain/EarnWageAccountAggregate";
import type { EventStore } from "../../event/EventStore";
import type { EventBus } from "../../event/EventBus";
import { DomainError } from "../../errors/DomainError";

@injectable()
export class WithdrawCreditCommandHandler implements CommandHandler {
    constructor(
        @inject("EventStore") private eventStore: EventStore,
        @inject("EventBus") private eventBus: EventBus
    ) {}

    async handle(command: WithdrawCreditCommand): Promise<void> {
        if (command.payload.amount <= 0) {
            throw new DomainError("Withdrawal amount must be positive");
        }

        const aggregate = new EarnWageAccountAggregate(command.payload.ebid);
        const events = await this.eventStore.getEvents(aggregate.getId());

        events.forEach((event) => aggregate.applyEvent(event));

        const newEvent = aggregate.withdrawCredit(command.payload.amount);
        await this.eventStore.save(newEvent);
        await this.eventBus.publish(newEvent);
    }
}
