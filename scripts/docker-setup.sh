#!/bin/bash

set -e

echo "🚀 Setting up Construction Management System with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Compose."
    exit 1
fi

# Use docker compose if available (newer Docker versions)
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

echo "📦 Building and starting containers..."
$COMPOSE_CMD up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until $COMPOSE_CMD exec -T postgres pg_isready -U construction_user > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma Client and push schema
echo "🔧 Setting up database..."
$COMPOSE_CMD exec -T app npx prisma generate || true
$COMPOSE_CMD exec -T app npx prisma db push || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Access the application at: http://localhost:3000"
echo "🗄️  Database is running on: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs:        $COMPOSE_CMD logs -f app"
echo "   Stop containers: $COMPOSE_CMD down"
echo "   Restart:         $COMPOSE_CMD restart"
echo "   Database shell:  $COMPOSE_CMD exec postgres psql -U construction_user -d construction_management"
echo ""

