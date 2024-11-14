// test/api.test.ts

import axios from "axios";
import { expect } from "chai";
import { describe, test, beforeAll, afterAll } from "bun:test";

import { Pool } from "pg";
import { config } from "dotenv";
config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "earnwage",
    password: process.env.POSTGRES_PASSWORD || "your_secure_password_here",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

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
    // Clean up database before running tests
    beforeAll(async () => {
        const uids = users.map((user) => user.uid);
        const placeholders = uids.map((_, i) => `$${i + 1}`).join(",");
        // Delete test data for the users
        if (uids.length > 0) {
            await pool.query(
                `DELETE FROM events WHERE uid IN (${placeholders})`,
                uids
            );
            await pool.query(
                `DELETE FROM balances WHERE uid IN (${placeholders})`,
                uids
            );
        }
    });

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

    afterAll(async () => {
        await pool.end();
    });
});
