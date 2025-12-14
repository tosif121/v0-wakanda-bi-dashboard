#!/bin/bash

# Wakanda BI Engine - Local Kestra Setup
# This script starts Kestra locally with Docker for development

echo "🏆 Starting Wakanda BI Engine - Local Kestra Server"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Stop any existing Kestra containers
echo "🧹 Cleaning up existing Kestra containers..."
docker stop kestra-local 2>/dev/null || true
docker rm kestra-local 2>/dev/null || true

# Create Kestra data directory
mkdir -p ./kestra-data

echo "🚀 Starting Kestra server..."
echo "   - Port: 8080"
echo "   - Username: tosifdevra786@gmail.com"
echo "   - Password: Tosif@121!"
echo "   - Data: ./kestra-data"

# Start Kestra with authentication
docker run -d \
  --name kestra-local \
  --pull=always \
  -p 8080:8080 \
  --user=root \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /tmp:/tmp \
  -v "$(pwd)/kestra-data:/app/data" \
  -v "$(pwd)/flows:/app/flows" \
  -e KESTRA_CONFIGURATION_PATH=/app/kestra.yml \
  kestra/kestra:latest server local

# Wait for Kestra to start
echo "⏳ Waiting for Kestra to start..."
sleep 10

# Check if Kestra is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Kestra is running successfully!"
    echo ""
    echo "🌐 Access Kestra UI: http://localhost:8080"
    echo "📧 Username: tosifdevra786@gmail.com"
    echo "🔑 Password: Tosif@121!"
    echo ""
    echo "📁 Workflow files are in: ./flows/"
    echo "💾 Data is stored in: ./kestra-data/"
    echo ""
    echo "🔧 To stop Kestra: docker stop kestra-local"
    echo "🗑️  To remove Kestra: docker rm kestra-local"
else
    echo "❌ Kestra failed to start. Check Docker logs:"
    echo "   docker logs kestra-local"
fi