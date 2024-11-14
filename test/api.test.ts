// test/api.test.ts

import axios from "axios";
import { expect } from "chai";
import { describe, test, beforeAll } from "bun:test";

const API_URL = "http://localhost:3000";

interface User {
    uid: string;
    expectedBalance: number;
    credits: number[];
}

const users: User[] = [
    {
        uid: "user1",
        expectedBalance: 0,
        credits: [100, 200, 300, 400],
    },
    {
        uid: "user2",
        expectedBalance: 0,
        credits: [500, 1000, 1500],
    },
    {
        uid: "user3",
        expectedBalance: 0,
        credits: [50, 150, 250, 350, 450],
    },
];

describe("API Tests", () => {
    // Calculate expected balances
    beforeAll(() => {
        users.forEach((user) => {
            user.expectedBalance = user.credits.reduce(
                (sum, credit) => sum + credit,
                0
            );
        });
    });

    describe("Credit Granting and Balance Checking", () => {
        // Test credit granting for each user
        users.forEach((user) => {
            describe(`User: ${user.uid}`, () => {
                // Grant credits
                test(`should grant multiple credits to ${user.uid}`, async () => {
                    for (const amount of user.credits) {
                        const response = await axios.post(
                            `${API_URL}/grant-credits`,
                            {
                                uid: user.uid,
                                amount,
                            }
                        );

                        expect(response.status).to.equal(200);
                        expect(response.data.message).to.equal(
                            "Credits granted successfully"
                        );
                    }
                });

                // Check final balance
                test(`should have correct final balance for ${user.uid}`, async () => {
                    const response = await axios.get(
                        `${API_URL}/balance/${user.uid}`
                    );

                    expect(response.status).to.equal(200);
                    expect(response.data.balance).to.equal(
                        user.expectedBalance
                    );
                });
            });
        });
    });

    // Error cases
    describe("Error Handling", () => {
        test("should reject negative credit amount", async () => {
            try {
                await axios.post(`${API_URL}/grant-credits`, {
                    uid: "user1",
                    amount: -100,
                });
                throw new Error("Should have failed");
            } catch (error: any) {
                expect(error.response.status).to.equal(400);
                expect(error.response.data.error).to.equal(
                    "Amount must be greater than 0"
                );
            }
        });

        test("should handle non-existent user balance check", async () => {
            try {
                await axios.get(`${API_URL}/balance/nonexistentuser`);
                throw new Error("Should have failed");
            } catch (error: any) {
                expect(error.response.status).to.equal(404);
                expect(error.response.data.error).to.equal("User not found");
            }
        });
    });
});
