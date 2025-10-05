#!/bin/bash

echo "🚀 ROK SERVICES - AUTO DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "Check your Vercel dashboard for the live URL"
