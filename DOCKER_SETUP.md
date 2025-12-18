# QuickTable - Docker Setup Guide

## Prerequisites

### 1. Install Docker Desktop
- **Download:** https://www.docker.com/products/docker-desktop
- **Windows Requirements:**
  - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
  - OR Windows 11 64-bit
  - WSL 2 (Windows Subsystem for Linux)
  - Enable Hyper-V and Containers Windows features

### 2. Verify Docker Installation
Open PowerShell or Command Prompt and run:
```bash
docker --version
docker-compose --version
```

You should see output like:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### 3. Start Docker Desktop
- Launch Docker Desktop application
- Wait for it to show "Docker Desktop is running"
- You should see the Docker icon in your system tray

---

## Quick Start (Easiest Method)

### Option 1: Using Batch Scripts (Windows)

1. **Start all services:**
   ```bash
   Double-click: docker-start.bat
   ```
   This will:
   - Build all Docker images
   - Start PostgreSQL, Backend, and Frontend
   - Show you the URLs when ready

2. **View logs:**
   ```bash
   Double-click: docker-logs.bat
   ```

3. **Stop all services:**
   ```bash
   Double-click: docker-stop.bat
   ```

### Option 2: Using Command Line

1. **Navigate to project directory:**
   ```bash
   cd c:\table_reservation\table_reservation
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

---

## What Gets Created

When you run `docker-compose up`, the following services start:

### 1. PostgreSQL Database
- **Container Name:** `quicktable-db`
- **Port:** 5432
- **Database:** quicktable
- **Username:** postgres
- **Password:** postgres123
- **Data Volume:** Persisted in Docker volume `postgres_data`

### 2. Spring Boot Backend
- **Container Name:** `quicktable-backend`
- **Port:** 8081
- **API Base URL:** http://localhost:8081/api
- **Health Check:** http://localhost:8081/actuator/health
- **Depends On:** PostgreSQL

### 3. Next.js Frontend
- **Container Name:** `quicktable-frontend`
- **Port:** 3000
- **URL:** http://localhost:3000
- **Depends On:** Backend

---

## First Time Setup (Wait Times)

**First build will take 5-15 minutes because:**
1. Downloading Docker base images (~2 GB)
2. Downloading Maven dependencies (~200 MB)
3. Downloading npm packages (~300 MB)
4. Building Spring Boot application
5. Building Next.js application

**Subsequent starts will be much faster (30-60 seconds)** because:
- Images are cached
- Dependencies are cached
- Only changed code needs rebuilding

---

## Step-by-Step Guide

### Step 1: Verify Docker is Running
```bash
docker ps
```
Should show a list of containers (might be empty if none running)

### Step 2: Build the Images
```bash
docker-compose build
```

**Expected Output:**
```
Building backend...
Step 1/10 : FROM maven:3.9.5-eclipse-temurin-17 AS build
...
Successfully built abc123def456
Successfully tagged table_reservation_backend:latest

Building frontend...
Step 1/12 : FROM node:20-alpine AS deps
...
Successfully built xyz789uvw123
Successfully tagged table_reservation_frontend:latest
```

### Step 3: Start the Services
```bash
docker-compose up -d
```

**Expected Output:**
```
Creating network "table_reservation_quicktable-network" with driver "bridge"
Creating volume "table_reservation_postgres_data" with default driver
Creating quicktable-db ... done
Creating quicktable-backend ... done
Creating quicktable-frontend ... done
```

### Step 4: Check Container Status
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                  STATUS              PORTS
quicktable-db         Up 2 minutes        0.0.0.0:5432->5432/tcp
quicktable-backend    Up 1 minute (healthy)  0.0.0.0:8081->8081/tcp
quicktable-frontend   Up 30 seconds       0.0.0.0:3000->3000/tcp
```

### Step 5: View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Step 6: Access the Application
- **Frontend:** Open browser to http://localhost:3000
- **Backend API:** http://localhost:8081/api
- **API Documentation:** http://localhost:8081/swagger-ui.html

---

## Common Docker Commands

### Viewing and Managing Containers

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker ps -a

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# Rebuild a specific service
docker-compose up --build -d backend
```

### Building and Starting

```bash
# Build images without starting
docker-compose build

# Build and start services
docker-compose up --build -d

# Start services (no build)
docker-compose up -d

# Force rebuild (no cache)
docker-compose build --no-cache
```

### Accessing Containers

```bash
# Execute command in running container
docker exec -it quicktable-backend bash

# Access PostgreSQL database
docker exec -it quicktable-db psql -U postgres -d quicktable

# View container logs
docker logs quicktable-backend
docker logs quicktable-frontend
```

### Cleanup Commands

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Clean everything (use with caution!)
docker system prune -a --volumes
```

---

## Troubleshooting

### Problem 1: Port Already in Use

**Error:**
```
Error starting userland proxy: listen tcp 0.0.0.0:3000: bind: address already in use
```

**Solutions:**
1. Stop the service using that port
2. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

### Problem 2: Database Connection Failed

**Error:**
```
Connection to postgres:5432 refused
```

**Solutions:**
1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Wait for health check to pass:
   ```bash
   docker-compose logs postgres
   ```

3. Restart the backend after postgres is ready:
   ```bash
   docker-compose restart backend
   ```

### Problem 3: Build Failed

**Error:**
```
npm ERR! network timeout
```
OR
```
Maven download failed
```

**Solutions:**
1. Check your internet connection
2. Retry the build:
   ```bash
   docker-compose build --no-cache
   ```

3. If behind a proxy, configure Docker proxy settings

### Problem 4: Container Keeps Restarting

**Check logs:**
```bash
docker-compose logs backend
```

**Common causes:**
- Database not ready → Wait for health check
- Environment variables missing → Check docker-compose.yml
- Application error → Check application logs

### Problem 5: Out of Memory

**Error:**
```
Cannot allocate memory
```

**Solution:**
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory limit to at least 4 GB
4. Click "Apply & Restart"

### Problem 6: Image Build Too Slow

**Solutions:**
1. Enable BuildKit for faster builds:
   ```bash
   set DOCKER_BUILDKIT=1
   set COMPOSE_DOCKER_CLI_BUILD=1
   docker-compose build
   ```

2. Use layer caching effectively (already configured in Dockerfiles)

### Problem 7: Frontend Can't Connect to Backend

**Check:**
1. Backend is running:
   ```bash
   curl http://localhost:8081/actuator/health
   ```

2. Frontend environment variable is correct:
   ```yaml
   environment:
     NEXT_PUBLIC_API_URL: http://localhost:8081/api
   ```

3. Both containers are on same network:
   ```bash
   docker network inspect table_reservation_quicktable-network
   ```

---

## Development Workflow

### Making Code Changes

#### Backend Changes:
1. Modify Java code
2. Rebuild and restart backend:
   ```bash
   docker-compose up --build -d backend
   ```
3. View logs to confirm:
   ```bash
   docker-compose logs -f backend
   ```

#### Frontend Changes:
1. Modify React/TypeScript code
2. Rebuild and restart frontend:
   ```bash
   docker-compose up --build -d frontend
   ```
3. Refresh browser

#### Database Changes:
If you need to reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

### Hot Reload (Development Mode)

For faster development, you can run services locally instead of in Docker:

**Backend:**
```bash
cd table-reservation-backend
mvn spring-boot:run
```

**Frontend:**
```bash
npm run dev
```

**Database (still in Docker):**
```bash
docker-compose up -d postgres
```

---

## Production Considerations

### Environment Variables
Never commit sensitive data! Use environment files:

1. Create `.env` file (gitignored):
   ```env
   POSTGRES_PASSWORD=super-secure-password
   JWT_SECRET=long-random-secret-key
   ```

2. Reference in docker-compose.yml:
   ```yaml
   env_file:
     - .env
   ```

### Security Improvements
1. Change default passwords
2. Use secrets management
3. Enable SSL/TLS
4. Restrict network access
5. Use specific image versions (not `latest`)

### Scaling
```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3
```

### Monitoring
Add monitoring services:
- Prometheus for metrics
- Grafana for dashboards
- ELK stack for logs

---

## Docker Compose File Explained

```yaml
version: '3.8'  # Docker Compose file format version

services:
  postgres:
    image: postgres:15-alpine  # Official PostgreSQL image
    container_name: quicktable-db  # Custom container name
    environment:  # Environment variables
      POSTGRES_DB: quicktable
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:  # Port mapping (host:container)
      - "5432:5432"
    volumes:  # Data persistence
      - postgres_data:/var/lib/postgresql/data
    networks:  # Connect to custom network
      - quicktable-network
    healthcheck:  # Health check configuration
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped  # Auto-restart policy

  backend:
    build:
      context: ./table-reservation-backend
      dockerfile: Dockerfile
    depends_on:  # Wait for postgres to be healthy
      postgres:
        condition: service_healthy

networks:
  quicktable-network:  # Custom bridge network
    driver: bridge

volumes:
  postgres_data:  # Named volume for data persistence
    driver: local
```

---

## Useful Tips

### 1. Check Resource Usage
```bash
docker stats
```

### 2. Inspect a Container
```bash
docker inspect quicktable-backend
```

### 3. Copy Files from Container
```bash
docker cp quicktable-backend:/app/logs ./logs
```

### 4. Save Container State
```bash
docker commit quicktable-backend my-backend-snapshot
```

### 5. Export/Import Volumes
```bash
# Export
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Import
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Next Steps

After Docker setup is complete:

1. ✅ Access the application at http://localhost:3000
2. ✅ Create test user account
3. ✅ Make a test reservation
4. ✅ Login as admin (credentials from DataInitializer.java)
5. ✅ Test all features

---

## Getting Help

### View Documentation
- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Spring Boot Docker: https://spring.io/guides/topicals/spring-boot-docker/
- Next.js Docker: https://nextjs.org/docs/deployment

### Check Status
```bash
# System info
docker info

# Version info
docker version

# Disk usage
docker system df
```

---

## Quick Reference Card

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `docker-compose ps` | List containers |
| `docker-compose restart backend` | Restart backend |
| `docker-compose up --build -d` | Rebuild and start |
| `docker-compose down -v` | Stop and remove data |

---

**You're all set! 🎉**

Run `docker-start.bat` and access your application at http://localhost:3000
