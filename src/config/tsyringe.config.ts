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
import { QueryBus } from "../core/query/QueryBus";
import { GetAccountBalanceQueryHandler } from "../core/query/handlers/GetAccountBalanceQueryHandler";
import { GetTransactionHistoryQueryHandler } from "../core/query/handlers/GetTransactionHistoryQueryHandler";
import { AccountBalanceProjection } from "../core/query/projections/AccountBalanceProjection";
import { TransactionHistoryProjection } from "../core/query/projections/TransactionHistoryProjection";
import { SagaManager } from "../core/saga/SagaManager";
import { ReversalSaga } from "../core/saga/ReversalSaga";
import { MonthlyResetSaga } from "../core/saga/MonthlyResetSaga";
import { ProcessReversalCommandHandler } from "../core/command/handlers/ProcessReversalCommandHandler";
import { ResetAccountCommandHandler } from "../core/command/handlers/ResetAccountCommandHandler";

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
container.register("QueryBus", QueryBus);
container.register(
    "GetAccountBalanceQueryHandler",
    GetAccountBalanceQueryHandler
);
container.register(
    "GetTransactionHistoryQueryHandler",
    GetTransactionHistoryQueryHandler
);
container.register("AccountBalanceProjection", AccountBalanceProjection);
container.register(
    "TransactionHistoryProjection",
    TransactionHistoryProjection
);
container.register("SagaManager", SagaManager);
container.register("ReversalSaga", ReversalSaga);
container.register("MonthlyResetSaga", MonthlyResetSaga);
container.register(
    "ProcessReversalCommandHandler",
    ProcessReversalCommandHandler
);
container.register("ResetAccountCommandHandler", ResetAccountCommandHandler);
