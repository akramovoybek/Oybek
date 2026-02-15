#!/bin/bash

# Contest Platform - Full Project Startup Script
# Starts: MySQL (Docker), Backend (Docker), Code Runner image build, Frontend (local)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Contest Platform - Starting Up${NC}"
echo -e "${GREEN}========================================${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Step 1: Build the Python code runner image
echo -e "\n${YELLOW}[1/5] Building code runner Docker image...${NC}"
docker build -t contest-runner ./docker/runner
echo -e "${GREEN}  Code runner image built successfully.${NC}"

# Step 2: Start MySQL and Backend via docker-compose
echo -e "\n${YELLOW}[2/5] Starting MySQL and Backend containers...${NC}"
docker-compose up -d --build
echo -e "${GREEN}  Containers started.${NC}"

# Step 3: Wait for backend to be healthy
echo -e "\n${YELLOW}[3/5] Waiting for backend to be ready...${NC}"
MAX_RETRIES=30
RETRY=0
until curl -s http://localhost:3000/api/health > /dev/null 2>&1 || [ $RETRY -eq $MAX_RETRIES ]; do
    RETRY=$((RETRY + 1))
    echo "  Waiting for backend... ($RETRY/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}  Backend may still be starting. Check 'docker-compose logs backend' if issues persist.${NC}"
else
    echo -e "${GREEN}  Backend is ready.${NC}"
fi

# Step 4: Install frontend dependencies if needed
echo -e "\n${YELLOW}[4/5] Setting up frontend...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install --prefix frontend
fi
echo -e "${GREEN}  Frontend dependencies ready.${NC}"

# Step 5: Start frontend dev server
echo -e "\n${YELLOW}[5/5] Starting frontend dev server...${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Services:${NC}"
echo -e "${GREEN}    Frontend:  http://localhost:5173${NC}"
echo -e "${GREEN}    Backend:   http://localhost:3000${NC}"
echo -e "${GREEN}    MySQL:     localhost:3307${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}  Press Ctrl+C to stop the frontend.${NC}"
echo -e "${YELLOW}  Run ./stop.sh to stop all services.${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd frontend && npm run dev
