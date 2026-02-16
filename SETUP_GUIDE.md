# Contest Platform - Complete Setup Guide

A comprehensive guide to set up and run the Contest Platform (Backend + Frontend).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Local Development Setup](#local-development-setup)
- [Testing the Platform](#testing-the-platform)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Overview

The Contest Platform consists of:

- **Backend + Frontend**: Node.js/Express with EJS templates (Port 3000)
- **Database**: MySQL 8.0 (Port 3306 internally, Port 3307 on host)
- **Code Runner**: Docker-based Python execution environment

```
Browser → Port 3000
       ↓
  Express + EJS (server-rendered pages)
       ↓
  MySQL Database → Port 3306
       ↓
  Docker Python Runner (isolated containers)
```

The frontend uses EJS templates rendered server-side. All pages are served directly from the Express backend on port 3000 — no separate frontend server is needed.

## Prerequisites

### Required Software

1. **Docker & Docker Compose**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
   - Or install Docker Engine + Docker Compose separately

2. **Git**
   - Required for cloning the repository

3. **Node.js & npm** (for local development)
   - Node.js 18+ recommended
   - npm comes bundled with Node.js

### Installation

#### On macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Git
brew install git

# Install Node.js (for local development)
brew install node

# Verify installations
docker --version
docker-compose --version
git --version
node --version
npm --version
```

#### On Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose

# Install Git
sudo apt install git

# Install Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
docker --version
docker-compose --version
git --version
node --version
npm --version
```

#### On Windows

1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. Install [Git for Windows](https://git-scm.com/download/win)
3. Install [Node.js](https://nodejs.org/) (for local development)

## Quick Start with Docker

This is the easiest way to get the entire platform running.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Oybek
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

The default values work for Docker setup. No changes needed.

### Step 3: Build the Python Runner Image

This image executes submitted code in isolation:

```bash
docker build -t contest-runner ./docker/runner
```

For Mac M1/M2 (Apple Silicon):
```bash
docker build --platform linux/arm64 -t contest-runner ./docker/runner
```

### Step 4: Start All Services

```bash
docker-compose up --build
```

This will:
- Start MySQL database (port 3307 → 3306)
- Build and start the backend (port 3000)
- Create necessary networks and volumes

Wait for the logs to show:
- `MySQL ready for connections`
- `Server running on port 3000`

### Step 5: Seed the Database

Open a **new terminal** (keep the previous one running):

```bash
docker exec contest-backend node seeds/seed.js
```

This creates:
- Default users (admin, alice, bob)
- Sample topics
- Sample problems with test cases
- Sample contests

### Step 6: Access the Platform

Open your browser and navigate to:

```
http://localhost:3000
```

All pages are served directly by the Express backend using EJS templates.

**Default Login Credentials:**

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| alice    | user123   | USER  |
| bob      | user123   | USER  |

## Local Development Setup

If you prefer to run the backend locally without Docker (you still need Docker for the code runner).

### Backend Setup (Local)

1. **Install MySQL**

```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt install mysql-server
sudo systemctl start mysql
```

2. **Create Database**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE contest_platform;
EXIT;
```

3. **Configure Environment**

Edit `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=contest_platform
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

DOCKER_RUNNER_IMAGE=contest-runner
EXECUTION_TIMEOUT=10
MEMORY_LIMIT=256m
```

4. **Install Dependencies**

```bash
npm install
```

5. **Build Python Runner (Required)**

Even for local development, you need Docker for code execution:

```bash
docker build -t contest-runner ./docker/runner
```

6. **Run Database Migrations**

```bash
npm run db:sync
```

7. **Seed the Database**

```bash
npm run db:seed
```

8. **Start the Backend**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The platform (backend + EJS frontend) will be available at `http://localhost:3000`

### Platform Features

- User authentication (login/register)
- Problem browsing and solving
- Code editor with syntax highlighting
- Real-time submission results
- Contest participation
- Admin dashboard (for admin users)
- User profiles and statistics

## Testing the Platform

### 1. Test Backend API

**Health Check:**
```bash
curl http://localhost:3000/api/auth/me
```

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "role": "USER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "alice",
    "password": "user123"
  }'
```

**Get Problems:**
```bash
curl http://localhost:3000/api/problems
```

### 2. Test Code Submission

```bash
# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"alice","password":"user123"}' | jq -r '.token')

# Submit solution for problem ID 1 (Two Sum)
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "problem_id": 1,
    "code": "a, b = map(int, input().split())\nprint(a + b)"
  }'
```

Note: Install `jq` for JSON parsing:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq
```

### 3. Test the Platform

1. Open `http://localhost:3000`
2. Click "Login"
3. Enter credentials (alice / user123)
4. Browse problems
5. Click on a problem
6. Write and submit a solution
7. View submission results

## Troubleshooting

### Docker Issues

**Issue: Port already in use**

```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :3307  # MySQL
lsof -i :5173  # Frontend (if using React dev server)

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

**Issue: Docker socket permission denied**

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# macOS: Ensure Docker Desktop is running
```

**Issue: Containers not starting**

```bash
# Check container status
docker ps -a

# View logs
docker logs contest-backend
docker logs contest-mysql

# Restart services
docker-compose down
docker-compose up --build
```

### MySQL Issues

**Issue: Can't connect to MySQL**

1. Wait longer - MySQL needs time to initialize
2. Check MySQL is running:
   ```bash
   docker ps | grep mysql
   ```
3. Check logs:
   ```bash
   docker logs contest-mysql
   ```
4. Restart services:
   ```bash
   docker-compose restart mysql
   ```

**Issue: Database seeding fails**

```bash
# Ensure backend is fully started
docker logs contest-backend

# Try again after 30 seconds
docker exec contest-backend node seeds/seed.js
```

### Frontend / Page Issues

**Issue: Pages not rendering**

1. Check backend is running: `curl http://localhost:3000/api/problems`
2. Check backend logs for EJS template errors
3. Verify EJS views exist in `src/views/`
4. Check browser console for errors

### Code Execution Issues

**Issue: Submissions stuck in PENDING**

1. Check Docker is running
2. Verify contest-runner image exists:
   ```bash
   docker images | grep contest-runner
   ```
3. Rebuild runner image:
   ```bash
   docker build -t contest-runner ./docker/runner
   ```
4. Check backend logs:
   ```bash
   docker logs contest-backend
   ```

**Issue: RUNTIME_ERROR on valid code**

1. Check test case format
2. Verify input/output handling
3. Check timeout settings in `.env`

## Useful Commands

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f mysql

# Rebuild containers
docker-compose up --build

# Restart services
docker-compose restart

# Execute commands in container
docker exec -it contest-backend bash
docker exec contest-backend npm run db:seed

# Access MySQL
docker exec -it contest-mysql mysql -u root -pcontestpass123 contest_platform

# Check running containers
docker ps

# Remove unused containers/images
docker system prune -a
```

### Backend Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Sync database (recreates tables)
npm run db:sync

# Seed database
npm run db:seed
```

### Startup/Shutdown Scripts

```bash
# Start all services (Docker + backend)
./start.sh

# Stop all services
./stop.sh

# Seed the database
./seed.sh
```

### Git Commands

```bash
# Pull latest changes
git pull

# View status
git status

# View logs
git log --oneline

# Create new branch
git checkout -b feature/my-feature

# Switch branches
git checkout main
```

## Project Structure

```
Oybek/
├── docker/
│   └── runner/              # Python runner Docker image
│       └── Dockerfile
├── seeds/
│   └── seed.js              # Database seeder
├── src/                     # Backend + frontend source
│   ├── config/
│   │   ├── constants.js
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rbac.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Problem.js
│   │   ├── Submission.js
│   │   └── ...
│   ├── routes/
│   │   ├── admin/
│   │   ├── pages.js         # EJS page rendering
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── submissions.js
│   │   └── ...
│   ├── services/
│   │   └── codeRunner.js
│   ├── views/               # EJS templates
│   │   ├── pages/           # User-facing pages
│   │   ├── admin/           # Admin panel pages
│   │   └── partials/        # Shared layout partials
│   └── app.js               # Express entry point
├── start.sh                 # Full startup script
├── stop.sh                  # Shutdown script
├── seed.sh                  # Database seeding script
├── .env.example             # Environment template
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Backend Dockerfile
├── package.json             # Backend dependencies
└── README.md
```

## Next Steps

1. **Explore the Platform**
   - Log in with admin credentials
   - Browse existing problems
   - Submit solutions
   - View leaderboards

2. **Create Content**
   - Add new problems (admin)
   - Create contests (admin)
   - Add test cases

3. **Customize**
   - Modify EJS templates in `src/views/`
   - Add new features
   - Configure execution limits
   - Add more programming languages

4. **Deploy**
   - Set up production environment
   - Configure reverse proxy (nginx)
   - Set up SSL certificates
   - Configure proper secrets

## Support

For issues or questions:

- Check existing documentation (README.md, MAC_M1_SETUP.md)
- Review Docker logs for errors
- Ensure all prerequisites are installed
- Verify network connectivity
- Check firewall settings

## Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable HTTPS in production
- Implement rate limiting
- Review code execution sandbox settings
- Keep dependencies updated

## Performance Tips

- Use Docker Compose for development
- Enable caching in production
- Optimize database queries
- Use CDN for frontend assets
- Monitor resource usage
- Set appropriate timeout limits

## Clean Installation

If you want to start completely fresh:

```bash
# Stop all services
docker-compose down -v

# Remove all Docker resources
docker system prune -a
docker volume prune

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall everything
npm install

# Rebuild Docker images
docker build -t contest-runner ./docker/runner
docker-compose up --build

# Reseed database (in a new terminal)
docker exec contest-backend node seeds/seed.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
