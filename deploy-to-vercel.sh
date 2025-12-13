#!/bin/bash

echo "🚀 Deploying Wakanda BI to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add Blob storage to your project"
echo "3. Copy the BLOB_READ_WRITE_TOKEN"
echo "4. Add it to your environment variables"
echo "5. Redeploy or pull env vars locally"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"