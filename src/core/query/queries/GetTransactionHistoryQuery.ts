// src/core/query/queries/GetTransactionHistoryQuery.ts
import type { Query } from "../Query";

export interface GetTransactionHistoryQuery extends Query {
    type: "GET_TRANSACTION_HISTORY";
    payload: {
        uid: string;
        page?: number;
        limit?: number;
    };
}
