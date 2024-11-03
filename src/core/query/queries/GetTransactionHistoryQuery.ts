// src/core/query/queries/GetTransactionHistoryQuery.ts
import type { Query } from "../Query";

export interface GetTransactionHistoryQuery extends Query {
    type: "GET_TRANSACTION_HISTORY";
    payload: {
        ebid: string;
        page?: number;
        limit?: number;
    };
}
