#!/bin/bash

set -e

echo "🧹 Cleaning up Docker containers and volumes..."

# Use docker compose if available (newer Docker versions)
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# Stop and remove containers
echo "Stopping containers..."
$COMPOSE_CMD down

# Remove volumes (optional - uncomment to remove all data)
# echo "Removing volumes..."
# $COMPOSE_CMD down -v

# Remove images (optional)
read -p "Do you want to remove Docker images? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing images..."
    docker rmi construction-management-app construction-management-db || true
fi

echo "✅ Cleanup complete!"

