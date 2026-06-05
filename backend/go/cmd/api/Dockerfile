# Build the Go REST API server.
FROM golang:1.24-alpine AS build
WORKDIR /src
ENV GOFLAGS=-mod=mod
COPY go.mod ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/api /api
EXPOSE 8080
ENTRYPOINT ["/api"]
