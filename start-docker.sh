#!/bin/bash

echo "=========================================="
echo "     Starting Space App Docker Environment"
echo "=========================================="

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

echo "Stopping existing containers..."
docker-compose down

echo "Cleaning up dangling images (volumes will be preserved)..."
docker images -f "dangling=true" -q | xargs -r docker rmi 2>/dev/null
echo "Dangling images cleaned."

echo "Loading environment variables from .env.production..."
set -a
source .env.production
set +a

echo "Building and starting containers (with no cache)..."
docker-compose build --no-cache
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Failed to start containers."
    exit 1
fi

echo ""
echo "=========================================="
echo "      Services are running!"
echo "=========================================="
echo "Web App: http://localhost:3010"
echo ""
echo "Services:"
echo "- space_app (Next.js Application)"
echo ""
echo "Showing logs... (Press Ctrl+C to exit logs, containers will keep running)"
echo ""

docker-compose logs -f
