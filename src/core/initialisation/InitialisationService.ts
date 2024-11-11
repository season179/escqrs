// src/core/initialization/InitializationService.ts
import type { Database } from "../../infrastructure/Database";
import type { SagaManager } from "../saga/SagaManager";
import type { AccountBalanceProjection } from "../query/projections/AccountBalanceProjection";
import type { TransactionHistoryProjection } from "../query/projections/TransactionHistoryProjection";

export class InitializationService {
    constructor(
        private database: Database,
        private sagaManager: SagaManager,
        private accountBalanceProjection: AccountBalanceProjection,
        private transactionHistoryProjection: TransactionHistoryProjection
    ) {
        this.initialize();
    }

    async initialize(): Promise<void> {
        // First, initialize the database
        await this.database.initialize();

        // Then, initialize the saga manager
        await this.sagaManager.initialize();

        // Finally, initialize the transaction history projection
        await this.transactionHistoryProjection.initialize();

        await this.accountBalanceProjection.initialize();
    }
}
