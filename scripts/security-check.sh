#!/bin/bash

# Security Check Script for RoK Services
echo "🔒 Running Security Audit for RoK Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for npm vulnerabilities
echo -e "\n${YELLOW}1. Checking npm dependencies...${NC}"
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No security vulnerabilities found in dependencies${NC}"
else
    echo -e "${RED}❌ Security vulnerabilities found! Run 'npm audit' for details${NC}"
    exit 1
fi

# Check for outdated packages
echo -e "\n${YELLOW}2. Checking for outdated packages...${NC}"
OUTDATED=$(npm outdated --depth=0 2>/dev/null)
if [ -z "$OUTDATED" ]; then
    echo -e "${GREEN}✅ All packages are up to date${NC}"
else
    echo -e "${YELLOW}⚠️  Some packages have updates available:${NC}"
    echo "$OUTDATED"
fi

# Check environment variables
echo -e "\n${YELLOW}3. Checking environment configuration...${NC}"
if [ -f ".env.local" ]; then
    if grep -q "NEXTAUTH_SECRET" .env.local && grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}✅ Essential environment variables are configured${NC}"
    else
        echo -e "${RED}❌ Missing essential environment variables${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env.local file found${NC}"
fi

# Check for sensitive files in git
echo -e "\n${YELLOW}4. Checking for sensitive files...${NC}"
if git check-ignore .env.local .env >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Sensitive files are properly ignored${NC}"
else
    echo -e "${RED}❌ Sensitive files might be tracked by git${NC}"
fi

# Check for secure headers
echo -e "\n${YELLOW}5. Verifying security headers configuration...${NC}"
if grep -q "X-Frame-Options" next.config.js && grep -q "Content-Security-Policy" next.config.js; then
    echo -e "${GREEN}✅ Security headers are configured${NC}"
else
    echo -e "${RED}❌ Security headers are missing or incomplete${NC}"
fi

# TypeScript check
echo -e "\n${YELLOW}6. Running TypeScript check...${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors found${NC}"
else
    echo -e "${RED}❌ TypeScript errors found! Run 'npm run type-check' for details${NC}"
fi

echo -e "\n${GREEN}🎉 Security audit completed!${NC}"
echo -e "${YELLOW}💡 Remember to:${NC}"
echo "   - Run this script regularly"
echo "   - Keep dependencies updated"
echo "   - Review security policies"
echo "   - Monitor application logs"