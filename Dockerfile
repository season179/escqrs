FROM oven/bun:1 as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN mkdir -p dist && bun build ./src/index.ts --outdir ./dist

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./

RUN bun install --production --frozen-lockfile

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "./dist/index.js"]
