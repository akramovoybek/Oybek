# Contest Platform

A local-network competitive programming platform built with Node.js, Express, MySQL, and Docker.

## Architecture

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

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start

### Option 1: Automated Setup (Recommended)

Run everything with a single command:

```bash
npm run setup
```

This will:
1. Build the Python runner image
2. Start all Docker services
3. Wait for MySQL to be ready
4. Seed the database with sample data

### Option 2: Manual Setup

#### 1. Build the Python runner image

```bash
docker build -t contest-runner ./docker/runner
```

#### 2. Start all services

```bash
docker-compose up -d --build
```

#### 3. Seed the database

Use the helper script that ensures containers are running:

```bash
npm run docker:seed
```

Or manually (only works if containers are already running):

```bash
docker exec contest-backend node seeds/seed.js
```

#### 4. Access the platform

- **Local:** http://localhost:3000
- **LAN:** http://<your-local-ip>:3000

## Common Issues

### "Container is not running" error when seeding

If you see this error:
```
Error response from daemon: container [...] is not running
```

**Solution:** Use `npm run docker:seed` instead of the direct `docker exec` command. This script automatically checks if containers are running and starts them if needed.

### Containers not starting

Check the logs:
```bash
npm run docker:logs
```

## Useful NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Complete setup: build, start, and seed everything |
| `npm run docker:up` | Start Docker services in detached mode |
| `npm run docker:down` | Stop all Docker services |
| `npm run docker:seed` | Seed database (starts containers if needed) |
| `npm run docker:logs` | View Docker container logs |
| `npm start` | Start backend (for development without Docker) |
| `npm run dev` | Start backend with nodemon (auto-reload) |

## Default Accounts

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | ADMIN |
| alice    | user123   | USER  |
| bob      | user123   | USER  |

## API Endpoints

### Authentication

| Method | Endpoint         | Description       | Auth |
|--------|------------------|-------------------|------|
| POST   | /api/auth/register | Register new user | No   |
| POST   | /api/auth/login    | Login             | No   |
| GET    | /api/auth/me       | Current user      | Yes  |

### Public

| Method | Endpoint                    | Description              |
|--------|----------------------------|--------------------------|
| GET    | /api/problems              | List problems            |
| GET    | /api/problems/:id          | Problem detail + samples |
| GET    | /api/topics                | List topics              |
| GET    | /api/contests              | List contests            |
| GET    | /api/contests/:id          | Contest detail           |
| GET    | /api/contests/:id/standings| Contest standings        |
| GET    | /api/users/:username       | User profile             |

### Authenticated (User)

| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | /api/submissions             | Submit solution      |
| GET    | /api/submissions             | My submissions       |
| GET    | /api/submissions/:id         | Submission detail    |
| POST   | /api/contests/:id/register   | Register for contest |

### Admin Only

| Method | Endpoint                                  | Description                    |
|--------|------------------------------------------|--------------------------------|
| GET    | /api/admin/topics                        | List topics + problem count    |
| POST   | /api/admin/topics                        | Create topic                   |
| PUT    | /api/admin/topics/:id                    | Edit topic                     |
| DELETE | /api/admin/topics/:id                    | Delete topic                   |
| GET    | /api/admin/problems                      | List problems (filterable)     |
| GET    | /api/admin/problems/:id                  | Problem detail + all testcases |
| POST   | /api/admin/problems                      | Create problem                 |
| PUT    | /api/admin/problems/:id                  | Edit problem                   |
| DELETE | /api/admin/problems/:id                  | Delete problem                 |
| POST   | /api/admin/problems/:id/testcases        | Add static testcase            |
| POST   | /api/admin/problems/:id/testcases/generate | Generate testcase from reference solution |
| DELETE | /api/admin/problems/:id/testcases/:tcId  | Delete testcase                |
| GET    | /api/admin/contests                      | List contests                  |
| GET    | /api/admin/contests/:id                  | Contest detail + participants  |
| POST   | /api/admin/contests                      | Create contest                 |
| PUT    | /api/admin/contests/:id                  | Edit contest                   |
| DELETE | /api/admin/contests/:id                  | Delete contest                 |
| POST   | /api/admin/contests/:id/problems         | Add problem to contest         |
| DELETE | /api/admin/contests/:id/problems/:pid    | Remove problem from contest    |

## Submission Flow

1. User POSTs code to `/api/submissions`
2. Submission is saved with `PENDING` verdict
3. All testcases for the problem are fetched
4. For each testcase, the code runs in an isolated Docker container:
   - No network access
   - Memory limited
   - CPU limited
   - Auto-destroyed after execution
5. Output is compared (trimmed) against expected output
6. Verdict is determined: `ACCEPTED`, `WRONG_ANSWER`, `RUNTIME_ERROR`, or `TIME_LIMIT_EXCEEDED`
7. Result is saved and returned

## Submission Example

```bash
# Login
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

## Docker Security

The code runner containers are isolated with:

- `--network none` — no internet/network access
- `--memory` / `--memory-swap` — memory limits
- `--cpus 1` — CPU limit
- `--read-only` — read-only filesystem
- `--cap-drop ALL` — no Linux capabilities
- `--security-opt no-new-privileges` — no privilege escalation
- Auto-removed (`--rm`) after execution
- Timeout enforcement via `execFile` timeout

## Project Structure

```
├── docker/
│   └── runner/
│       └── Dockerfile          # Python runner image
├── seeds/
│   └── seed.js                 # Sample data seeder
├── src/
│   ├── config/
│   │   ├── constants.js        # Enums and constants
│   │   └── database.js         # Sequelize connection
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Global error handler
│   │   └── rbac.js             # Role-based access control
│   ├── models/
│   │   ├── index.js            # Model associations
│   │   ├── User.js
│   │   ├── Topic.js
│   │   ├── Problem.js
│   │   ├── Testcase.js
│   │   ├── Contest.js
│   │   ├── ContestProblem.js
│   │   ├── Registration.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── contests.js     # Admin contest management
│   │   │   ├── problems.js     # Admin problem management
│   │   │   └── topics.js       # Admin topic management
│   │   ├── auth.js             # Login / Register
│   │   ├── contests.js         # Public contest routes
│   │   ├── problems.js         # Public problem routes
│   │   ├── submissions.js      # Submission routes
│   │   ├── topics.js           # Public topic routes
│   │   └── users.js            # User profile routes
│   ├── services/
│   │   └── codeRunner.js       # Docker code execution
│   ├── utils/
│   │   └── syncDb.js           # Force-sync database
│   └── app.js                  # Express entry point
├── docker-compose.yml
├── Dockerfile                  # Backend image
├── package.json
└── README.md
```

## Stopping

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```
