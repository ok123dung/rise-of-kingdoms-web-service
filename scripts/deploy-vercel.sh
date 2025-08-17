#!/bin/bash

echo "🚀 Starting Vercel Deployment Process..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}Step 1: Environment Variables${NC}"
echo "Please ensure you have added the following environment variables to Vercel:"
echo ""
echo "DATABASE_URL"
echo "DIRECT_URL"
echo "NEXT_PUBLIC_SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "SUPABASE_SERVICE_ROLE_KEY"
echo "NEXTAUTH_URL"
echo "NEXTAUTH_SECRET"
echo ""
echo -e "${YELLOW}Press Enter when ready...${NC}"
read

echo -e "${GREEN}Step 2: Deploy to Vercel${NC}"
echo "Deploying to production..."
vercel --prod

echo ""
echo -e "${GREEN}Step 3: Post-Deployment Tasks${NC}"
echo "After deployment completes:"
echo "1. Run database migrations in Supabase SQL Editor"
echo "2. Test all critical paths"
echo "3. Configure custom domain (if needed)"
echo ""
echo -e "${GREEN}Deployment process complete!${NC}"