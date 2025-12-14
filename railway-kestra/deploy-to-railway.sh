#!/bin/bash

# 🚀 Deploy Kestra to Railway
echo "🚀 Deploying Kestra to Railway..."

# Error handling
set -e
trap 'echo "❌ Deployment failed. Check the logs above for details."' ERR

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    if ! npm install -g @railway/cli; then
        echo "❌ Failed to install Railway CLI. Please install manually: npm install -g @railway/cli"
        exit 1
    fi
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway login --check &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Check if project is linked, if not create new one
if ! railway status &> /dev/null; then
    echo "📦 Creating new Railway project..."
    if ! railway init; then
        echo "❌ Failed to initialize Railway project"
        exit 1
    fi
else
    echo "✅ Railway project already linked"
fi

# Set environment variables in Railway (secure method)
echo "🔧 Setting up environment variables in Railway..."

# Read from parent .env.local and set variables securely
if [ -f "../.env.local" ]; then
    echo "📋 Reading environment variables from .env.local..."
    
    # Extract values from .env.local with proper quoting and validation
    PERPLEXITY_KEY=$(grep "^PERPLEXITY_API_KEY=" ../.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" ../.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" ../.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    
    # Validate extracted variables
    if [ -z "$PERPLEXITY_KEY" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
        echo "⚠️  Some environment variables are missing or empty in .env.local"
        echo "Please ensure the following variables are set:"
        echo "  - PERPLEXITY_API_KEY"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo ""
        echo "You can set them manually in Railway dashboard after deployment."
    else
        # Initialize failed variables tracker
        FAILED_VARS=""
        
        # Set variables in Railway using correct CLI syntax with proper error handling
        echo "Setting PERPLEXITY_API_KEY... (hidden for security)"
        if railway variables --set "PERPLEXITY_API_KEY=$PERPLEXITY_KEY" &> /dev/null; then
            echo "✅ PERPLEXITY_API_KEY set successfully"
        else
            echo "❌ Failed to set PERPLEXITY_API_KEY - check Railway authentication"
            FAILED_VARS="$FAILED_VARS PERPLEXITY_API_KEY"
        fi
        
        echo "Setting SUPABASE_URL... (hidden for security)"
        if railway variables --set "SUPABASE_URL=$SUPABASE_URL" &> /dev/null; then
            echo "✅ SUPABASE_URL set successfully"
        else
            echo "❌ Failed to set SUPABASE_URL - check Railway authentication"
            FAILED_VARS="$FAILED_VARS SUPABASE_URL"
        fi
        
        echo "Setting SUPABASE_KEY... (hidden for security)"
        if railway variables --set "SUPABASE_KEY=$SUPABASE_KEY" &> /dev/null; then
            echo "✅ SUPABASE_KEY set successfully"
        else
            echo "❌ Failed to set SUPABASE_KEY - check Railway authentication"
            FAILED_VARS="$FAILED_VARS SUPABASE_KEY"
        fi
        
        if [ -n "$FAILED_VARS" ]; then
            echo "⚠️  Some variables failed to set:$FAILED_VARS"
            echo "You can set them manually in Railway dashboard after deployment"
        else
            echo "✅ All environment variables set successfully"
        fi
    fi
else
    echo "⚠️  .env.local not found. Please set environment variables manually in Railway dashboard."
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
if [ "$CI" = "true" ] || [ -n "$GITHUB_ACTIONS" ]; then
    # Use detached mode for CI/CD environments
    echo "🤖 CI/CD environment detected, using detached deployment"
    if ! railway up --detach; then
        echo "❌ Deployment failed. Please check Railway logs for details."
        exit 1
    fi
else
    # Interactive mode for local development
    if ! railway up; then
        echo "❌ Deployment failed. Please check Railway logs for details."
        exit 1
    fi
fi

# Get the deployment URL
echo "🌐 Getting deployment URL..."
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not retrieve Railway URL automatically."
    echo "Please check your Railway dashboard for the deployment URL."
    RAILWAY_URL="https://your-kestra-app.railway.app"
fi

echo ""
echo "✅ Kestra deployment to Railway completed!"
echo "🌐 Your Kestra instance URL: $RAILWAY_URL"
echo ""
echo "📊 Next steps:"
echo "1. Update your .env.local file:"
echo "   KESTRA_URL=$RAILWAY_URL"
echo ""
echo "2. Test your deployment:"
echo "   npm run dev"
echo ""
echo "3. Access Kestra UI at: $RAILWAY_URL"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"