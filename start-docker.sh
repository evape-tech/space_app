#!/bin/bash

echo "=========================================="
echo "     Starting Space App Docker Environment"
echo "=========================================="

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production file with required environment variables."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "✅ Stopping existing containers..."
docker compose down || true

echo "🧹 Cleaning up dangling images (volumes will be preserved)..."
docker images -f "dangling=true" -q | xargs -r docker rmi 2>/dev/null || true
echo "✅ Dangling images cleaned."

echo "📝 Loading environment variables from .env.production..."
set -a
source .env.production
set +a

echo "🔨 Building and starting containers (with no cache)..."
docker compose build --no-cache
docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "      Services are running!"
    echo "=========================================="
    echo "🌐 Web App: http://localhost:6000"
    echo ""
    echo "📋 Services:"
    echo "- space_app (Next.js Application)"
    echo ""
    echo "📜 Showing logs... (Press Ctrl+C to exit logs, containers will keep running)"
    echo ""
    docker compose logs -f
else
    echo "⚠️  Failed to start some containers, but script will continue."
    echo "Check the errors above for details."
    read -p "Press Enter to exit..."
fi
