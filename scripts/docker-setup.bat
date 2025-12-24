@echo off
echo 🚀 Setting up Construction Management System with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

echo 📦 Building and starting containers...
docker-compose up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking PostgreSQL connection...
:check_db
docker-compose exec -T postgres pg_isready -U construction_user >nul 2>&1
if errorlevel 1 (
    echo    Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto check_db
)

echo ✅ PostgreSQL is ready!

echo 🔧 Setting up database...
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma db push

echo.
echo ✅ Setup complete!
echo.
echo 📱 Access the application at: http://localhost:3000
echo 🗄️  Database is running on: localhost:5432
echo.
echo 📋 Useful commands:
echo    View logs:        docker-compose logs -f app
echo    Stop containers: docker-compose down
echo    Restart:         docker-compose restart
echo.

pause

