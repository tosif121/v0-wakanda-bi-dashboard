#!/bin/bash

# Wakanda BI Engine - Complete Deployment Script
# Deploys to Vercel and sets up local Kestra

echo "🏆 Wakanda BI Engine - Complete Deployment"
echo "=========================================="

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker Desktop."
    exit 1
fi

if ! command_exists vercel; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js."
    exit 1
fi

echo "✅ All prerequisites found!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod
if [ $? -eq 0 ]; then
    echo "✅ Vercel deployment successful!"
    VERCEL_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*\.vercel\.app')
    echo "🌐 Production URL: $VERCEL_URL"
else
    echo "❌ Vercel deployment failed!"
    exit 1
fi

# Start local Kestra
echo ""
echo "🐳 Setting up local Kestra..."
./start-kestra.sh

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "🌐 Frontend: $VERCEL_URL"
echo "🔧 Kestra: http://localhost:8080"
echo "📧 Kestra Login: tosifdevra786@gmail.com / Tosif@121!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Kestra UI: http://localhost:8080"
echo "2. Deploy the workflow: flows/bi-dashboard.yml"
echo "3. Test the frontend with Kestra running locally"
echo ""
echo "🛠️  Useful Commands:"
echo "   - Stop Kestra: docker stop kestra-local"
echo "   - View logs: docker logs kestra-local"
echo "   - Restart: ./start-kestra.sh"