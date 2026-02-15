# Mac M1 Setup Guide - Contest Platform

This guide will help you set up and run the Contest Platform on your Mac M1 (Apple Silicon).

## Prerequisites Installation

### 1. Install Homebrew (if not already installed)

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the on-screen instructions to add Homebrew to your PATH.

### 2. Install Docker Desktop for Mac

**Option A: Using Homebrew**
```bash
brew install --cask docker
```

**Option B: Manual Download**
1. Visit https://www.docker.com/products/docker-desktop/
2. Download "Docker Desktop for Mac with Apple Silicon"
3. Open the downloaded .dmg file
4. Drag Docker to Applications folder
5. Launch Docker from Applications

**Verify Docker is running:**
```bash
docker --version
docker-compose --version
```

You should see version information for both commands.

### 3. Install Git (if not already installed)

```bash
brew install git
```

Verify:
```bash
git --version
```

### 4. Install Node.js (Optional - only needed for local development)

If you want to run the project locally without Docker:

```bash
brew install node
```

Verify:
```bash
node --version
npm --version
```

## Project Setup

### Step 1: Navigate to Project Directory

```bash
cd /path/to/Oybek
```

### Step 2: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

The default values should work fine for local development. Edit `.env` if you need to change any settings.

### Step 3: Build the Python Runner Image

This is the Docker image that will execute submitted code in isolation:

```bash
docker build -t contest-runner ./docker/runner
```

**For M1 Macs:** Docker will automatically build ARM64 images, which is perfect for your system.

### Step 4: Start All Services

Start the MySQL database and backend server:

```bash
docker-compose up --build
```

This will:
- Pull the MySQL 8.0 image (ARM64 compatible)
- Build the backend Node.js application
- Start both services
- Create necessary networks and volumes

**Wait for the services to be ready.** You should see logs indicating:
- MySQL is ready for connections
- Backend server is running on port 3000

### Step 5: Seed the Database

Open a **new terminal window** (keep the previous one running), navigate to the project directory, and run:

```bash
docker exec contest-backend node seeds/seed.js
```

This will create:
- Sample users (admin, alice, bob)
- Sample topics
- Sample problems with testcases
- Sample contests

### Step 6: Access the Platform

Open your web browser and navigate to:

```
http://localhost:3000
```

## Default Login Credentials

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| alice    | user123   | USER  |
| bob      | user123   | USER  |

## Troubleshooting Mac M1 Issues

### Issue 1: Docker Platform Warning

If you see platform warnings, you can explicitly build for ARM64:

```bash
docker build --platform linux/arm64 -t contest-runner ./docker/runner
docker-compose up --build --platform linux/arm64
```

### Issue 2: Docker Socket Permission Denied

If you get permission errors accessing Docker socket:

1. Make sure Docker Desktop is running
2. Check Docker Desktop settings:
   - Open Docker Desktop
   - Go to Settings > Advanced
   - Ensure "Allow the default Docker socket to be used" is enabled

### Issue 3: Port Already in Use

If port 3000 or 3306 is already in use:

**Check what's using the port:**
```bash
lsof -i :3000
lsof -i :3306
```

**Option 1:** Stop the conflicting service

**Option 2:** Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Issue 4: MySQL Connection Issues

If the backend can't connect to MySQL:

1. Wait longer - MySQL needs time to initialize (check logs)
2. Restart the services:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Issue 5: Containers Not Starting

Check container status:
```bash
docker ps -a
```

Check logs:
```bash
docker logs contest-backend
docker logs contest-mysql
```

## Useful Commands

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Database Volume

```bash
docker-compose down -v
```

**Warning:** This will delete all data in the database.

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild After Code Changes

```bash
docker-compose up --build
```

### Access MySQL Database Directly

```bash
docker exec -it contest-mysql mysql -u root -pcontestpass123 contest_platform
```

### Run Database Seed Again

```bash
docker exec contest-backend node seeds/seed.js
```

## Testing the Platform

### 1. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","role":"USER"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"alice","password":"user123"}'
```

### 2. Submit a Solution

```bash
# First, get a token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"alice","password":"user123"}' | jq -r '.token')

# Submit a solution for "Two Sum" (problem_id: 1)
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "problem_id": 1,
    "code": "a, b = map(int, input().split())\nprint(a + b)"
  }'
```

**Note:** You need `jq` for the above commands. Install it with:
```bash
brew install jq
```

## Development Workflow

### Running Without Docker (Local Development)

If you prefer to run the backend locally:

1. Install MySQL locally:
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. Create the database:
   ```bash
   mysql -u root -e "CREATE DATABASE contest_platform;"
   ```

3. Update `.env` file:
   ```
   DB_HOST=localhost
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run the application:
   ```bash
   npm run dev
   ```

**Note:** You still need Docker for the code runner containers.

## Architecture Overview

```
Client (Browser)
      ↓
  Express API (port 3000)
      ↓
  MySQL Database (port 3306)
      ↓
  Submission Service
      ↓
  Docker Python Runner (isolated container)
```

## Next Steps

1. Log in with admin credentials
2. Create new problems
3. Create contests
4. Invite users to participate
5. Submit solutions and see results

## Support

For issues or questions:
- Check the main README.md file
- Review Docker logs for error messages
- Ensure all prerequisites are properly installed
- Make sure Docker Desktop is running before starting services

## Clean Installation

If you want to start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove the runner image
docker rmi contest-runner

# Remove any dangling images
docker system prune -a

# Start from Step 3 again
docker build -t contest-runner ./docker/runner
docker-compose up --build
```
