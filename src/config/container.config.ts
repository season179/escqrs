import { ServiceContainer } from "../core/container/ServiceContainer";
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
import { EventStreamOptimizer } from "../core/performance/EventStreamOptimizer";
import { QueryOptimizer } from "../core/performance/QueryOptimizer";
import { Logger } from "../core/logging/Logger";
import { Metrics } from "../core/monitoring/Metrics";

export function initializeContainer(): void {
    const container = ServiceContainer.getInstance();

    // Infrastructure
    const database = new Database();
    const messageBroker = new RedisMessageBroker();
    container.register("Database", database);
    container.register("MessageBroker", messageBroker);

    // Core services
    const eventStore = new EventStore(database);
    const eventBus = new EventBus(messageBroker);
    const commandBus = new CommandBus(messageBroker);
    const queryBus = new QueryBus(messageBroker);

    container.register("EventStore", eventStore);
    container.register("EventBus", eventBus);
    container.register("CommandBus", commandBus);
    container.register("QueryBus", queryBus);
    container.register(
        "GrantCreditCommandHandler",
        new GrantCreditCommandHandler(eventStore, eventBus)
    );
    container.register(
        "WithdrawCreditCommandHandler",
        new WithdrawCreditCommandHandler(eventStore, eventBus)
    );
    container.register("QueryBus", new QueryBus(messageBroker));
    container.register(
        "GetAccountBalanceQueryHandler",
        new GetAccountBalanceQueryHandler(database)
    );
    container.register(
        "GetTransactionHistoryQueryHandler",
        new GetTransactionHistoryQueryHandler(database)
    );
    container.register(
        "AccountBalanceProjection",
        new AccountBalanceProjection(database)
    );
    container.register(
        "TransactionHistoryProjection",
        new TransactionHistoryProjection(database)
    );
    container.register("SagaManager", new SagaManager(database));
    container.register(
        "ReversalSaga",
        new ReversalSaga(commandBus, eventBus, new SagaManager(database))
    );
    container.register(
        "MonthlyResetSaga",
        new MonthlyResetSaga(
            commandBus,
            eventBus,
            new SagaManager(database),
            database
        )
    );
    container.register(
        "ProcessReversalCommandHandler",
        new ProcessReversalCommandHandler(eventStore, eventBus)
    );
    container.register(
        "ResetAccountCommandHandler",
        new ResetAccountCommandHandler(eventStore, eventBus)
    );
    container.register(
        "EventStreamOptimizer",
        new EventStreamOptimizer(database)
    );
    container.register("QueryOptimizer", new QueryOptimizer(database));
    container.register("Logger", new Logger());
    container.register("Metrics", new Metrics());
}
