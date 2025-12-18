@echo off
echo ========================================
echo  QuickTable - Starting Docker Services
echo ========================================
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker is installed.
echo.

echo Stopping any existing containers...
docker-compose down

echo.
echo Building and starting services...
echo This may take 5-10 minutes on first run...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Services Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8081/api
echo Database: localhost:5432
echo.
echo View logs: docker-compose logs -f
echo Stop:      docker-compose down
echo.
pause
