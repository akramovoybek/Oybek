# Contest Platform - Complete Setup Guide

A comprehensive guide to set up and run the Contest Platform (Backend + Frontend).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Local Development Setup](#local-development-setup)
- [Frontend Setup](#frontend-setup)
- [Testing the Platform](#testing-the-platform)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## Overview

The Contest Platform consists of:

- **Backend**: Node.js/Express API (Port 3000)
- **Frontend**: React + Vite (Port 5173)
- **Database**: MySQL 8.0 (Port 3306/3307)
- **Code Runner**: Docker-based Python execution environment

```
Browser (Frontend) → Port 5173
       ↓
  Express API → Port 3000
       ↓
  MySQL Database → Port 3306
       ↓
  Docker Python Runner (isolated containers)
```

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

### Step 6: Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 7: Access the Platform

Open your browser and navigate to:

```
http://localhost:5173
```

**Default Login Credentials:**

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| alice    | user123   | USER  |
| bob      | user123   | USER  |

## Local Development Setup

If you prefer to run services locally without Docker.

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

Backend will be available at `http://localhost:3000`

### Frontend Setup (Local)

1. **Navigate to Frontend Directory**

```bash
cd frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure API Endpoint (Optional)**

If your backend is not on `localhost:3000`, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

4. **Start Development Server**

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

5. **Build for Production**

```bash
npm run build
npm run preview
```

## Frontend Setup

### Environment Variables

Create `frontend/.env.local` (optional):

```env
# API Base URL (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000

# For production
# VITE_API_URL=https://your-api-domain.com
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Frontend Features

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

### 3. Test Frontend

1. Open `http://localhost:5173`
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
lsof -i :5173  # Frontend

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

### Frontend Issues

**Issue: API calls failing**

1. Check backend is running: `curl http://localhost:3000/api/problems`
2. Check CORS settings in backend
3. Verify API URL in frontend code
4. Check browser console for errors

**Issue: Module not found errors**

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue: Build fails**

```bash
# Clear cache
rm -rf frontend/node_modules/.vite

# Rebuild
npm run build
```

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

### Frontend Commands

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
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
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── seeds/
│   └── seed.js              # Database seeder
├── src/                     # Backend source
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
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── submissions.js
│   │   └── ...
│   ├── services/
│   │   └── codeRunner.js
│   └── app.js               # Express entry point
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
   - Modify frontend styling
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
rm -rf node_modules frontend/node_modules
rm -rf package-lock.json frontend/package-lock.json

# Reinstall everything
npm install
cd frontend && npm install && cd ..

# Rebuild Docker images
docker build -t contest-runner ./docker/runner
docker-compose up --build

# Reseed database
docker exec contest-backend node seeds/seed.js

# Restart frontend
cd frontend && npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
