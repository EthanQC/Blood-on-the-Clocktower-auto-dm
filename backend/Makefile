.PHONY: run build test docker-up docker-down sqlc dev swagger

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOTEST=$(GOCMD) test
GOMOD=$(GOCMD) mod

# Binary name
BINARY=agentdm

# Build the application
build:
	$(GOBUILD) -o bin/$(BINARY) ./cmd/server

# Run the application
run: build
	./bin/$(BINARY)

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# Tidy modules
tidy:
	$(GOMOD) tidy

# Generate SQLC code
sqlc:
	cd db && sqlc generate

# Start Docker containers
docker-up:
	docker-compose up -d

# Stop Docker containers
docker-down:
	docker-compose down

# Show Docker logs
docker-logs:
	docker-compose logs -f

# Apply database migrations (auto via docker-compose init scripts)
migrate-up:
	@echo "Migrations are auto-applied via docker-compose init scripts"

# Run linter
lint:
	golangci-lint run ./...

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

# Start local development environment
dev: docker-up
	@echo "Waiting for MySQL to be ready..."
	@sleep 5
	$(MAKE) run

# Run with AutoDM enabled (requires GEMINI_API_KEY in .env or environment)
run-autodm: build
	@if [ -f .env ]; then \
		export $$(cat .env | grep -v '^#' | xargs) && AUTODM_ENABLED=true ./bin/$(BINARY); \
	else \
		AUTODM_ENABLED=true ./bin/$(BINARY); \
	fi

# Load environment from .env and run
run-env: build
	@if [ -f .env ]; then \
		export $$(cat .env | grep -v '^#' | xargs) && ./bin/$(BINARY); \
	else \
		./bin/$(BINARY); \
	fi

# Generate Swagger documentation
swagger:
	@echo "Swagger docs are embedded in docs/docs.go"
	@echo "Access at http://localhost:8080/swagger/index.html after starting server"

# Build Docker image
docker-build:
	docker build -t botc-autodm:latest .

# Show help
help:
	@echo "Blood on the Clocktower Auto-DM Backend"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build         Build the binary"
	@echo "  run           Build and run the server"
	@echo "  run-env       Run with .env file loaded"
	@echo "  run-autodm    Run with AutoDM enabled"
	@echo "  dev           Start docker + run server (development)"
	@echo "  test          Run tests"
	@echo "  test-coverage Run tests with coverage report"
	@echo "  lint          Run linter"
	@echo "  docker-up     Start Docker containers"
	@echo "  docker-down   Stop Docker containers"
	@echo "  docker-logs   Show Docker logs"
	@echo "  docker-build  Build Docker image"
	@echo "  swagger       Show Swagger info"
	@echo "  clean         Clean build artifacts"
	@echo "  help          Show this help"
