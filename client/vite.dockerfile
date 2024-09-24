FROM oven/bun:1.1.28-slim

WORKDIR /app

COPY client/bun.lockb client/package.json ./
# not --ci because this is the dev server
RUN bun install
COPY client .

CMD [ "bun", "dev" ]
