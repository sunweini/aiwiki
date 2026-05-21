.PHONY: dev test build migrate seed

dev:
	go run cmd/server/main.go

test:
	go test ./... -v -cover

build:
	go build -o bin/server cmd/server/main.go

migrate:
	@echo "AutoMigrate runs automatically on startup"

seed:
	go run cmd/seed/main.go
