@echo off
echo ==========================================
echo      Starting Space App Docker Environment
echo ==========================================

:: Check if docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Stopping existing containers...
docker-compose down

echo Cleaning up dangling images (volumes will be preserved)...
for /f "tokens=*" %%i in ('docker images -f "dangling=true" -q 2^>nul') do (
    docker rmi %%i 2>nul
)
echo Dangling images cleaned.

echo Loading environment variables from .env.production...
for /f "usebackq tokens=1,* delims==" %%A in (".env.production") do (
    if not "%%A"=="" if not "%%A:~0,1%"=="#" (
        set "%%A=%%B"
    )
)

echo Building and starting containers (with no cache)...
docker-compose build --no-cache
docker-compose up -d

if %errorlevel% neq 0 (
    echo Failed to start containers.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       Services are running!
echo ==========================================
echo Web App: http://localhost:3010
echo.
echo Services:
echo - space_app (Next.js Application)
echo.
echo Showing logs... (Press Ctrl+C to exit logs, containers will keep running)
echo.

docker-compose logs -f
