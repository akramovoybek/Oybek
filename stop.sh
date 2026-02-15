#!/bin/bash

# Contest Platform - Stop All Services

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}========================================${NC}"
echo -e "${RED}  Contest Platform - Shutting Down${NC}"
echo -e "${RED}========================================${NC}"

# Stop docker-compose services (MySQL + Backend)
echo "Stopping Docker containers..."
docker-compose down

echo -e "\n${GREEN}All services stopped.${NC}"
echo -e "  To also remove database data: docker-compose down -v"
