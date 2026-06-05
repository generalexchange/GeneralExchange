# Build the Go WebSocket server.
FROM golang:1.24-alpine AS build
WORKDIR /src
ENV GOFLAGS=-mod=mod
COPY go.mod ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o /out/ws ./cmd/ws

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/ws /ws
EXPOSE 8081
ENTRYPOINT ["/ws"]
