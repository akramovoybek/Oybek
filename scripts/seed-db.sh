#!/bin/bash

set -e

echo "=========================================="
echo "Contest Platform - Database Seeder"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running.${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if contest-backend container exists and is running
if ! docker ps --format '{{.Names}}' | grep -q "^contest-backend$"; then
    echo -e "${YELLOW}Backend container is not running.${NC}"
    echo "Starting Docker Compose services..."
    echo ""

    # Check if containers exist but are stopped
    if docker ps -a --format '{{.Names}}' | grep -q "^contest-backend$"; then
        echo "Starting existing containers..."
        docker-compose start
    else
        echo "Building and starting containers for the first time..."
        docker-compose up -d --build
    fi

    echo ""
    echo -e "${GREEN}Containers started successfully.${NC}"
else
    echo -e "${GREEN}Backend container is already running.${NC}"
fi

# Wait for MySQL to be ready
echo ""
echo "Waiting for MySQL to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec contest-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "${GREEN}MySQL is ready!${NC}"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Error: MySQL did not become ready in time.${NC}"
    echo "Please check the logs with: docker-compose logs mysql"
    exit 1
fi

# Run the seed script
echo ""
echo "Running database seed script..."
echo ""
docker exec contest-backend node seeds/seed.js

echo ""
echo -e "${GREEN}=========================================="
echo "Database seeded successfully!"
echo "==========================================${NC}"
