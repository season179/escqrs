// src/tests/load/k6/scenarios/query-performance.ts
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, DURATION_SECONDS, VIRTUAL_USERS } from "../config";

export const options = {
    scenarios: {
        query_performance: {
            executor: "constant-vus",
            vus: VIRTUAL_USERS,
            duration: `${DURATION_SECONDS}s`,
        },
    },
    thresholds: {
        http_req_duration: ["p(95)<200"], // 95% of requests should be below 200ms
        http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
    },
};

export default function () {
    const ebid = `emp_${Math.floor(Math.random() * 100)}`; // Use smaller pool for more cache hits

    // Get balance
    const balanceResponse = http.get(`${BASE_URL}/accounts/${ebid}/balance`);

    check(balanceResponse, {
        "balance query status is 200": (r) => r.status === 200,
    });

    sleep(0.5);

    // Get transaction history
    const historyResponse = http.get(
        `${BASE_URL}/accounts/${ebid}/transactions?page=1&limit=10`
    );

    check(historyResponse, {
        "transaction history status is 200": (r) => r.status === 200,
        "transaction history is array": (r) =>
            Array.isArray(JSON.parse(r.body).transactions),
    });

    sleep(0.5);
}
