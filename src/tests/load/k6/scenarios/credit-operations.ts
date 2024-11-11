// src/tests/load/k6/scenarios/credit-operations.ts
import { post, get } from "k6/http";
import type { Response } from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, VIRTUAL_USERS } from "../config";

export const options = {
    scenarios: {
        credit_operations: {
            executor: "ramping-vus",
            startVUs: 1,
            stages: [
                { duration: "1m", target: VIRTUAL_USERS },
                { duration: "3m", target: VIRTUAL_USERS },
                { duration: "1m", target: 0 },
            ],
            gracefulRampDown: "30s",
        },
    },
    thresholds: {
        http_req_duration: ["p(95)<500"],
        http_req_failed: ["rate<0.01"],
    },
};

const generateTestData = () => ({
    uid: `emp_${Math.floor(Math.random() * 1000)}`,
    amount: Math.floor(Math.random() * 1000) + 100,
});

export default function () {
    const testData = generateTestData();

    const grantResponse = post(
        `${BASE_URL}/accounts/${testData.uid}/credits`,
        JSON.stringify({ amount: testData.amount }),
        { headers: { "Content-Type": "application/json" } }
    );

    check(grantResponse, {
        "grant credit status is 202": (r: Response): boolean =>
            r.status === 202,
    });

    sleep(1);

    const balanceResponse = get(`${BASE_URL}/accounts/${testData.uid}/balance`);

    check(balanceResponse, {
        "get balance status is 200": (r: Response): boolean => r.status === 200,
        "balance is correct": (r: Response): boolean => {
            const balance = JSON.parse(r.body).balance;
            return balance >= 0;
        },
    });

    sleep(1);

    const withdrawAmount = Math.floor(testData.amount / 2);
    const withdrawResponse = post(
        `${BASE_URL}/accounts/${testData.uid}/withdrawals`,
        JSON.stringify({ amount: withdrawAmount }),
        { headers: { "Content-Type": "application/json" } }
    );

    check(withdrawResponse, {
        "withdraw credit status is 202": (r: Response): boolean =>
            r.status === 202,
    });

    sleep(1);
}
