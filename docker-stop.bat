@echo off
echo ========================================
echo  QuickTable - Stopping Docker Services
echo ========================================
echo.

docker-compose down

echo.
echo All services stopped.
echo.
pause
