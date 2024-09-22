FROM golang:1.23 AS server-build

WORKDIR /app/server

COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/*.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /rider

FROM server-build AS server-test
RUN go test -v ./...

FROM oven/bun:1.1.28-slim AS client-build

WORKDIR /app/client

# Install node modules for the client app
COPY client/bun.lockb client/package.json ./
RUN bun install --ci
COPY client .

# Build static files for the client app
RUN bun run build

# Purge any files which aren't from the build
RUN find . -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=client-build /app/client/dist /dist
COPY --from=server-build /rider /rider

EXPOSE 8000
ENTRYPOINT [ "/rider" ]
