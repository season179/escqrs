// src/tests/load/k6/scenarios/event-sourcing-performance.ts
import { post, get } from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, DURATION_SECONDS, VIRTUAL_USERS } from "../config";

export const options = {
    scenarios: {
        event_sourcing: {
            executor: "per-vu-iterations",
            vus: VIRTUAL_USERS,
            iterations: 100,
            maxDuration: `${DURATION_SECONDS}s`,
        },
    },
    thresholds: {
        http_req_duration: ["p(95)<1000"], // 95% of requests should be below 1s
        http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
    },
};

export default function () {
    const ebid = `emp_${Math.floor(Math.random() * 10)}`; // Use very small pool to generate lots of events

    // Perform multiple operations to generate events
    for (let i = 0; i < 5; i++) {
        // Grant credit
        const grantResponse = post(
            `${BASE_URL}/accounts/${ebid}/credits`,
            JSON.stringify({ amount: 100 }),
            { headers: { "Content-Type": "application/json" } }
        );

        check(grantResponse, {
            "grant credit status is 202": (r) => r.status === 202,
        });

        sleep(0.1);

        // Withdraw credit
        const withdrawResponse = post(
            `${BASE_URL}/accounts/${ebid}/withdrawals`,
            JSON.stringify({ amount: 50 }),
            { headers: { "Content-Type": "application/json" } }
        );

        check(withdrawResponse, {
            "withdraw credit status is 202": (r) => r.status === 202,
        });

        sleep(0.1);
    }

    // Check final balance to verify event replay
    const balanceResponse = get(`${BASE_URL}/accounts/${ebid}/balance`);

    check(balanceResponse, {
        "balance query status is 200": (r) => r.status === 200,
    });
}
