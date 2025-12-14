#!/bin/bash

# 🚀 Deploy Kestra to Render
echo "🚀 Deploying Kestra to Render..."

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo "❌ Error: .env.local file not found in parent directory"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

# Extract environment variables with better error handling
PERPLEXITY_KEY=$(grep "^PERPLEXITY_API_KEY=" ../.env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" ../.env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" ../.env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")

# Validate extracted variables - ENFORCE required variables
MISSING_VARS=""
if [ -z "$PERPLEXITY_KEY" ]; then
    MISSING_VARS="$MISSING_VARS PERPLEXITY_API_KEY"
fi
if [ -z "$SUPABASE_URL" ]; then
    MISSING_VARS="$MISSING_VARS NEXT_PUBLIC_SUPABASE_URL"
fi
if [ -z "$SUPABASE_KEY" ]; then
    MISSING_VARS="$MISSING_VARS NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

if [ -n "$MISSING_VARS" ]; then
    echo "❌ Error: Critical environment variables are missing in .env.local:"
    for var in $MISSING_VARS; do
        echo "  - $var"
    done
    echo ""
    echo "Please add these variables to .env.local before deployment."
    echo "Deployment cannot proceed without these critical variables."
    exit 1
fi

echo "📋 Steps to deploy on Render:"
echo ""
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository: https://github.com/tosif121/v0-wakanda-bi-dashboard"
echo "4. Configure the service:"
echo "   - Name: kestra-wakanda-bi"
echo "   - Environment: Docker"
echo "   - Region: Oregon (US West)"
echo "   - Branch: main"
echo "   - Root Directory: render-kestra"
echo "   - Dockerfile Path: ./Dockerfile (relative to render-kestra)"
echo "   - Plan: Free"
echo ""
echo "   ⚠️  IMPORTANT: Make sure Root Directory is set to 'render-kestra'"
echo "   ⚠️  This ensures Render uses the Kestra Dockerfile, not the Next.js one"
echo ""
echo "5. Add Environment Variables:"
echo "   - KESTRA_SERVER_PORT: 10000"
echo "   - JAVA_OPTS: -Xmx512m -Xms256m"
echo ""
echo "   🔐 Security Variables (REQUIRED - following Kestra patterns):"
echo "   - KESTRA_SECURITY_BASIC_USERNAME: [choose_secure_username]"
echo "   - KESTRA_SECURITY_BASIC_PASSWORD: [choose_secure_password]"
echo "   - KESTRA_DATASOURCES_POSTGRES_PASSWORD: [choose_secure_db_password]"
echo ""
echo "   🔑 API Keys (from .env.local):"
echo "   - PERPLEXITY_API_KEY: [DETECTED - copy from .env.local]"
echo "   - SUPABASE_URL: [DETECTED - copy from .env.local]"
echo "   - SUPABASE_KEY: [DETECTED - copy from .env.local]"
echo ""
echo "   ⚠️  SECURITY NOTE: Never use default passwords in production!"
echo "   ⚠️  All credentials are hidden for security - copy from .env.local"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
echo "🌐 Your Kestra will be available at: https://kestra-wakanda-bi.onrender.com"
echo ""
echo "📝 Then update your .env.local:"
echo "KESTRA_URL=https://kestra-wakanda-bi.onrender.com"
echo ""
echo "✅ Render is more reliable than Railway for Docker deployments!"
echo ""
echo "🔄 If Render doesn't work, fallback to local:"
echo "docker run --pull=always --rm -it -p 8080:8080 --user=root \\"
echo "  -v /var/run/docker.sock:/var/run/docker.sock \\"
echo "  -v /tmp:/tmp \\"
echo "  -e JAVA_OPTS=\"-XX:UseSVE=0\" \\"
echo "  kestra/kestra:latest server local"