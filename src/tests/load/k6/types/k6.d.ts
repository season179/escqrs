// src/tests/load/k6/types/k6.d.ts
declare module "k6/http" {
    export interface Response {
        status: number;
        body: string;
        headers: { [key: string]: string };
        timings: { [key: string]: number };
    }

    export function post(
        url: string,
        body: string | object,
        params?: object
    ): Response;
    export function get(url: string, params?: object): Response;
}

declare module "k6" {
    import type { Response } from "k6/http";
    export function check(
        response: Response,
        checks: Record<string, (r: Response) => boolean>
    ): boolean;
    export function sleep(seconds: number): void;
}
