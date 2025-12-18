# 🚀 QuickTable - Quick Start Guide

## ✅ What Has Been Set Up

All Docker configuration files have been created:

1. ✅ **Backend Dockerfile** - `table-reservation-backend/Dockerfile`
2. ✅ **Frontend Dockerfile** - `Dockerfile` (root)
3. ✅ **Docker Compose** - `docker-compose.yml`
4. ✅ **Helper Scripts** - `docker-start.bat`, `docker-stop.bat`, `docker-logs.bat`
5. ✅ **Documentation** - `DOCKER_SETUP.md`

---

## 🎯 Next Steps - Start Your Application

### Option 1: Easy Start (Recommended for Windows)

**Just double-click this file:**
```
docker-start.bat
```

This will:
- Build all Docker images
- Start PostgreSQL database
- Start Spring Boot backend
- Start Next.js frontend
- Show you when everything is ready

⏰ **First time will take 5-10 minutes** (downloading images and building)

---

### Option 2: Command Line

1. **Open PowerShell or Command Prompt**

2. **Navigate to project folder:**
   ```bash
   cd c:\table_reservation\table_reservation
   ```

3. **Start everything:**
   ```bash
   docker-compose up --build -d
   ```

4. **Wait for services to start** (check status):
   ```bash
   docker-compose ps
   ```

   You should see all 3 services as "Up" and "healthy"

5. **View logs** (to see progress):
   ```bash
   docker-compose logs -f
   ```
   Press `Ctrl+C` to exit logs

---

## 🌐 Access Your Application

Once services are running:

- **Frontend (Main App):** http://localhost:3000
- **Backend API:** http://localhost:8081/api
- **API Documentation:** http://localhost:8081/swagger-ui.html
- **Database:** localhost:5432

### Default Login Credentials:

**Admin Account:**
- Email: `admin@quicktable.com`
- Password: `admin123`

**Staff Account:**
- Email: `staff@quicktable.com`
- Password: `staff123`

**Manager Account:**
- Email: `manager@quicktable.com`
- Password: `manager123`

---

## 🔍 How to Check if Everything is Working

### 1. Check Container Status
```bash
docker-compose ps
```

**Expected output:**
```
NAME                  STATUS              PORTS
quicktable-db         Up (healthy)        0.0.0.0:5432->5432/tcp
quicktable-backend    Up (healthy)        0.0.0.0:8081->8081/tcp
quicktable-frontend   Up                  0.0.0.0:3000->3000/tcp
```

### 2. Check Backend Health
Open browser to: http://localhost:8081/actuator/health

**Expected response:**
```json
{"status":"UP"}
```

### 3. Check Frontend
Open browser to: http://localhost:3000

You should see the QuickTable homepage

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

---

## 🛑 How to Stop

### Option 1: Easy Stop
**Double-click:**
```
docker-stop.bat
```

### Option 2: Command Line
```bash
docker-compose down
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Port already in use"

**Error:**
```
Error: bind: address already in use
```

**Solution:**
1. Stop the service using that port
2. Or change ports in `docker-compose.yml`

**Check what's using a port:**
```bash
# Check port 3000
netstat -ano | findstr :3000

# Check port 8081
netstat -ano | findstr :8081
```

### Issue 2: "Docker daemon not running"

**Error:**
```
Cannot connect to Docker daemon
```

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start
3. Try again

### Issue 3: Backend keeps restarting

**Check logs:**
```bash
docker-compose logs backend
```

**Common cause:** Database not ready yet
**Solution:** Wait 1-2 minutes for PostgreSQL health check to pass

### Issue 4: Build is very slow

**Normal on first run!** Docker is:
- Downloading base images (~2 GB)
- Downloading Maven dependencies (~200 MB)
- Downloading npm packages (~300 MB)
- Building applications

**Subsequent builds will be much faster** (30-60 seconds)

---

## 📋 Testing Checklist

After everything starts, test these features:

### Frontend Tests:
- [ ] Homepage loads at http://localhost:3000
- [ ] Can navigate to login page
- [ ] Can view table layout
- [ ] Can access reservation form

### Backend Tests:
- [ ] API health check works: http://localhost:8081/actuator/health
- [ ] Swagger UI loads: http://localhost:8081/swagger-ui.html
- [ ] Can login via API

### Integration Tests:
- [ ] Register new user account
- [ ] Login with admin credentials
- [ ] Make a test reservation
- [ ] View reservation in admin dashboard
- [ ] Check pre-order indicators appear
- [ ] Test staff dashboard filters
- [ ] Test global search

---

## 📊 View Running Containers

```bash
# List containers
docker-compose ps

# View resource usage
docker stats

# View all containers
docker ps -a
```

---

## 🧹 Clean Up / Reset

### Stop services but keep data:
```bash
docker-compose down
```

### Stop and delete database (fresh start):
```bash
docker-compose down -v
```

### Remove all images and rebuild from scratch:
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build -d
```

---

## 📚 Additional Resources

- **Full Docker Guide:** See `DOCKER_SETUP.md`
- **Presentation Materials:** See `PRESENTATION_OUTLINE.md`
- **Final Report:** See `FINAL_EXAM_REPORT.md`

---

## 🎬 Quick Demo Script

**For presentation/testing:**

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for healthy status** (2-3 minutes):
   ```bash
   docker-compose ps
   ```

3. **Open application:**
   - Frontend: http://localhost:3000
   - Login as customer and make reservation with pre-order

4. **Show admin view:**
   - Login as admin@quicktable.com
   - Go to reservations
   - Show pre-order indicator 🛒
   - Click to view details

5. **Show staff view:**
   - Login as staff@quicktable.com
   - Show date filters
   - Test global search (Ctrl+K)

---

## ⚡ Quick Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up --build -d

# Status
docker-compose ps

# Restart one service
docker-compose restart backend
```

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ All 3 containers show "Up" status
✅ Backend shows "(healthy)" status
✅ Frontend loads at http://localhost:3000
✅ You can login with admin credentials
✅ You can make a reservation
✅ Reservation appears in admin dashboard

---

## 🚀 Ready to Start?

### Easiest Way:
1. **Double-click:** `docker-start.bat`
2. **Wait:** 5-10 minutes (first time)
3. **Open browser:** http://localhost:3000
4. **Login:** admin@quicktable.com / admin123

### Command Line Way:
```bash
cd c:\table_reservation\table_reservation
docker-compose up --build -d
docker-compose logs -f
```

Then open http://localhost:3000

---

**Need help?** Check `DOCKER_SETUP.md` for detailed troubleshooting!

**Good luck! 🎉**
