// src/core/query/queries/GetAccountBalanceQuery.ts
import type { Query } from "../Query";

export interface GetAccountBalanceQuery extends Query {
    type: "GET_ACCOUNT_BALANCE";
    payload: {
        uid: string;
        ebid?: string;
    };
}
