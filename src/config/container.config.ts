import { ServiceContainer } from "../core/container/ServiceContainer";
import { CommandBus } from "../core/command/CommandBus";
import { EventBus } from "../core/event/EventBus";
import { EventStore } from "../core/event/EventStore";
import { Database } from "../infrastructure/Database";
import { AzureServiceBusMessageBroker } from "../infrastructure/AzureServiceBusMessageBroker";
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
import { InitializationService } from "../core/initialisation/InitialisationService";
import type { CommandHandler } from "../core/command/CommandHandler";
import { env } from "./env.config";

export function initializeContainer(): void {
    const container = ServiceContainer.getInstance();

    // Infrastructure
    const database = new Database();
    const messageBroker = new AzureServiceBusMessageBroker(env.AZURE_SERVICE_BUS_CONNECTION_STRING);

    // Create instances
    const sagaManager = new SagaManager(database);
    const transactionHistoryProjection = new TransactionHistoryProjection(
        database
    );
    const accountBalanceProjection = new AccountBalanceProjection(database);

    // Create initialization service
    const initializationService = new InitializationService(
        database,
        sagaManager,
        accountBalanceProjection,
        transactionHistoryProjection
    );

    container.register("Database", database);
    container.register("MessageBroker", messageBroker);
    container.register("SagaManager", sagaManager);
    container.register("AccountBalanceProjection", accountBalanceProjection);
    container.register(
        "TransactionHistoryProjection",
        transactionHistoryProjection
    );
    container.register("InitializationService", initializationService);

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
    const handler: CommandHandler = container.resolve("GrantCreditCommandHandler");
    // console.log("Retrieved handler:", handler);
    commandBus.register("GRANT_CREDIT", handler);


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
        "ReversalSaga",
        new ReversalSaga(commandBus, eventBus, sagaManager)
    );
    container.register(
        "MonthlyResetSaga",
        new MonthlyResetSaga(commandBus, eventBus, sagaManager, database)
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
