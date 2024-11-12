// src/config/env.config.ts
import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    // PostgreSQL
    POSTGRES_HOST: z.string().default("localhost"),
    POSTGRES_PORT: z.string().default("5432"),
    POSTGRES_DB: z.string().default("earnwage"),
    POSTGRES_USER: z.string().default("postgres"),
    POSTGRES_PASSWORD: z.string(),

    // Server
    PORT: z.string().default("3000"),

    // Azure Service Bus
    AZURE_SERVICE_BUS_CONNECTION_STRING: z.string(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
    console.error("❌ Invalid environment variables:", envParse.error.format());
    process.exit(1);
}

export const env = envParse.data;
