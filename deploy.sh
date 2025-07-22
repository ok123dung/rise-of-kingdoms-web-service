#!/bin/bash

# Rise of Kingdoms Services Website Deployment Script
# Target: rokdbot.com production deployment

echo "🚀 Starting RoK Services Website Deployment..."

# Step 1: Final build verification
echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Step 2: Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: RoK Services website ready for production"
    
    echo "📝 Please add your GitHub remote:"
    echo "git remote add origin https://github.com/yourusername/rok-services.git"
    echo "git push -u origin main"
    echo ""
    echo "Then run this script again to continue deployment."
    exit 0
fi

# Step 3: Deploy to Vercel
echo "🌐 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure custom domain rokdbot.com in Vercel dashboard"
echo "2. Set up Cloudflare DNS records:"
echo "   - CNAME @ → cname.vercel-dns.com"
echo "   - CNAME www → cname.vercel-dns.com"
echo "3. Add environment variables in Vercel:"
echo "   - NEXT_PUBLIC_SITE_URL=https://rokdbot.com"
echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
echo "4. Apply Cloudflare optimizations from cloudflare-config.md"
echo ""
echo "🎯 Revenue targets:"
echo "   - Basic Strategy: 750,000 VNĐ/tháng"
echo "   - Pro Strategy: 900,000 VNĐ/tháng" 
echo "   - Premium Strategy: 1,200,000 VNĐ/tháng"
echo "   - Total potential: 15.6-30M VNĐ/tháng"
