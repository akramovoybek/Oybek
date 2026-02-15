# Makefile for Contest Platform
# Enables BuildKit by default for all Docker operations

# Enable BuildKit for improved build performance
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

.PHONY: help build-runner up down restart logs seed clean rebuild

help: ## Show this help message
	@echo "Contest Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build-runner: ## Build the Python runner image
	docker build -t contest-runner ./docker/runner

up: ## Start all services (MySQL + backend)
	docker-compose up --build

up-detached: ## Start all services in detached mode
	docker-compose up --build -d

down: ## Stop all services
	docker-compose down

down-volumes: ## Stop all services and remove volumes (deletes database)
	docker-compose down -v

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs only
	docker-compose logs -f backend

logs-mysql: ## View MySQL logs only
	docker-compose logs -f mysql

seed: ## Seed the database with sample data
	docker exec contest-backend node seeds/seed.js

clean: ## Remove all containers, images, and volumes
	docker-compose down -v
	docker rmi contest-runner || true
	docker system prune -f

rebuild: ## Clean rebuild (remove everything and start fresh)
	$(MAKE) clean
	$(MAKE) build-runner
	$(MAKE) up

setup: ## Complete setup (build runner + start services + seed database)
	$(MAKE) build-runner
	$(MAKE) up-detached
	@echo "Waiting for services to be ready..."
	@sleep 10
	$(MAKE) seed
	@echo ""
	@echo "Setup complete! Access the platform at http://localhost:3000"
	@echo "Default credentials:"
	@echo "  Admin:  admin / admin123"
	@echo "  User:   alice / user123"

status: ## Show status of all containers
	docker ps -a | grep contest || echo "No contest containers running"

mysql-shell: ## Open MySQL shell
	docker exec -it contest-mysql mysql -u root -pcontestpass123 contest_platform
