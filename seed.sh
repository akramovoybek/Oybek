#!/bin/bash

# Contest Platform - Seed Database
# Run this after start.sh to populate the database with sample data

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Seeding database...${NC}"
docker exec contest-backend node seeds/seed.js
echo -e "${GREEN}Database seeded successfully!${NC}"
echo ""
echo "Default accounts:"
echo "  Admin:  admin / admin123"
echo "  Users:  alice / user123, bob / user123"
