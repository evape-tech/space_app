@echo off
echo ==========================================
echo      Starting Space App Docker Environment
echo ==========================================

:: Check if docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

:: Check if .env.production exists
if not exist ".env.production" (
    echo ❌ .env.production file not found!
    echo Please create .env.production file with required environment variables.
    pause
    exit /b 1
)

echo ✅ Stopping existing containers...
docker compose down
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Failed to stop containers (they may not exist)
)

echo 🧹 Cleaning up dangling images (volumes will be preserved)...
for /f "tokens=*" %%i in ('docker images -f "dangling=true" -q 2^>nul') do (
    docker rmi %%i 2>nul
)
echo ✅ Dangling images cleaned.

echo 📝 Loading environment variables from .env.production...
for /f "usebackq tokens=1,* delims==" %%A in (".env.production") do (
    if not "%%A"=="" if not "%%A:~0,1%"=="#" (
        set "%%A=%%B"
    )
)

echo 🔨 Building and starting containers (with no cache)...
docker compose build --no-cache
docker compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo       Services are running!
    echo ==========================================
    echo 🌐 Web App: http://localhost:3010
    echo.
    echo 📋 Services:
    echo - space_app (Next.js Application)
    echo.
    echo 📜 Showing logs... (Press Ctrl+C to exit logs, containers will keep running)
    echo.
    docker compose logs -f
) else (
    echo ⚠️  Failed to start some containers, but script will continue.
    echo Check the errors above for details.
    pause
)
