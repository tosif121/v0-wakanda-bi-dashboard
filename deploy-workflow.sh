#!/bin/bash

# Deploy Wakanda BI Workflow to Kestra
echo "🏆 Deploying Wakanda BI Workflow to Kestra"
echo "==========================================="

# Check if Kestra is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Kestra is not running. Please start it first:"
    echo "   ./start-kestra.sh"
    exit 1
fi

echo "✅ Kestra is running"

# Deploy workflow using Kestra CLI (if available) or curl
echo "📤 Deploying workflow..."

# Create namespace first
curl -X POST "http://localhost:8080/api/v1/namespaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'tosifdevra786@gmail.com:Tosif@121!' | base64)" \
  -d '{"id": "assemblehack25.wakanda", "description": "Wakanda BI Engine Namespace"}' \
  2>/dev/null || true

# Deploy the workflow
RESPONSE=$(curl -s -X POST "http://localhost:8080/api/v1/flows" \
  -H "Content-Type: application/x-yaml" \
  -H "Authorization: Basic $(echo -n 'tosifdevra786@gmail.com:Tosif@121!' | base64)" \
  --data-binary @flows/bi-dashboard.yml)

if echo "$RESPONSE" | grep -q "wakanda_business_intelligence_engine"; then
    echo "✅ Workflow deployed successfully!"
    echo "🌐 View in Kestra UI: http://localhost:8080/ui/flows/assemblehack25.wakanda/wakanda_business_intelligence_engine"
else
    echo "⚠️  Workflow deployment response:"
    echo "$RESPONSE"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "🔧 Kestra UI: http://localhost:8080"
echo "📧 Login: tosifdevra786@gmail.com / Tosif@121!"
echo "🚀 Workflow: assemblehack25.wakanda/wakanda_business_intelligence_engine"