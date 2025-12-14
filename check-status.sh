#!/bin/bash

# Wakanda BI Engine - Status Check
echo "🏆 Wakanda BI Engine - Status Check"
echo "==================================="

# Check Vercel deployment
echo "🌐 Checking Vercel deployment..."
VERCEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://v0-wakanda-bi-dashboard-7esgbv6vs-tosif121s-projects.vercel.app")
if [ "$VERCEL_STATUS" = "200" ]; then
    echo "✅ Vercel: ONLINE (Status: $VERCEL_STATUS)"
    echo "   URL: https://v0-wakanda-bi-dashboard-7esgbv6vs-tosif121s-projects.vercel.app"
else
    echo "❌ Vercel: OFFLINE (Status: $VERCEL_STATUS)"
fi

# Check local Kestra
echo ""
echo "🐳 Checking local Kestra..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Kestra: ONLINE"
    echo "   URL: http://localhost:8080"
    echo "   Login: tosifdevra786@gmail.com / Tosif@121!"
else
    echo "❌ Kestra: OFFLINE"
    echo "   Start with: ./start-kestra.sh"
fi

# Check Docker container
echo ""
echo "🐋 Checking Docker container..."
if docker ps | grep -q kestra-local; then
    echo "✅ Docker: kestra-local container running"
else
    echo "❌ Docker: kestra-local container not found"
    echo "   Start with: ./start-kestra.sh"
fi

# Check local development server
echo ""
echo "💻 Checking local development server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Local Dev: ONLINE (http://localhost:3000)"
else
    echo "❌ Local Dev: OFFLINE"
    echo "   Start with: npm run dev"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "Frontend (Production): https://v0-wakanda-bi-dashboard-7esgbv6vs-tosif121s-projects.vercel.app"
echo "Kestra (Local):        http://localhost:8080"
echo "Development (Local):   http://localhost:3000"