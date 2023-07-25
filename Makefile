NETWORK_NAME := picpay-net

.PHONY: create_network

up-all:
	@echo "Checking if network $(NETWORK_NAME) exists..."
	@if ! docker network ls | grep -q $(NETWORK_NAME); then \
		echo "Creating network $(NETWORK_NAME)..."; \
		docker network create $(NETWORK_NAME); \
	fi
	@echo "Starting containers..."
	docker-compose up -d
	docker-compose ps -a

down:
	@echo "Stopping containers..."
	docker-compose down

test-account:
	@echo "Running account tests..."
	cd services/account && npx jest

	@sleep 1

	@echo "Running account e2e tests..."
	cd services/account && npm run test:e2e

test-transaction:
	@echo "Running transaction tests..."
	cd services/transaction && npx jest

	@sleep 1

	@echo "Running transaction e2e tests..."
	cd services/transaction && npm run test:e2e