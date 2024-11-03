// src/config/tsyringe.config.ts
import "reflect-metadata";
import { container } from "tsyringe";
import { CommandBus } from "../core/command/CommandBus";
import { EventBus } from "../core/event/EventBus";
import { EventStore } from "../core/event/EventStore";
import { Database } from "../infrastructure/Database";
import { RedisMessageBroker } from "../infrastructure/RedisMessageBroker";
import { GrantCreditCommandHandler } from "../core/command/handlers/GrantCreditCommandHandler";
import { WithdrawCreditCommandHandler } from "../core/command/handlers/WithdrawCreditCommandHandler";

container.register("Database", Database);
container.register("MessageBroker", RedisMessageBroker);
container.register("CommandBus", CommandBus);
container.register("EventBus", EventBus);
container.register("EventStore", EventStore);
container.register("GrantCreditCommandHandler", GrantCreditCommandHandler);
container.register(
    "WithdrawCreditCommandHandler",
    WithdrawCreditCommandHandler
);
