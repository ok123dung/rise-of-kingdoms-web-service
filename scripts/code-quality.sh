#!/bin/bash

# Code Quality Check Script for RoK Services

set -e

echo "🔍 Running Code Quality Checks..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# Function to run a check
run_check() {
    local check_name=$1
    local check_command=$2
    
    echo -n "Running $check_name... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED=1
    fi
}

# 1. TypeScript Type Checking
echo "1. TypeScript Type Checking"
run_check "Type Check" "npm run type-check"

echo ""

# 2. ESLint
echo "2. ESLint Analysis"
run_check "ESLint" "npm run lint"

echo ""

# 3. Prettier Formatting
echo "3. Code Formatting"
run_check "Prettier" "npm run format:check"

echo ""

# 4. Check for console.log statements (excluding test files and logger)
echo "4. Console Statement Check"
CONSOLE_COUNT=$(grep -r "console\." src --exclude-dir=__tests__ --exclude="client-logger.ts" --exclude="logger.ts" | wc -l)
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    echo -e "Console Statements... ${GREEN}✓ PASSED${NC}"
else
    echo -e "Console Statements... ${RED}✗ FAILED${NC} (Found $CONSOLE_COUNT console statements)"
    FAILED=1
fi

echo ""

# 5. Check for any remaining 'any' types
echo "5. TypeScript 'any' Type Usage"
ANY_COUNT=$(grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l)
if [ "$ANY_COUNT" -eq 0 ]; then
    echo -e "No 'any' types... ${GREEN}✓ PASSED${NC}"
else
    echo -e "No 'any' types... ${YELLOW}⚠ WARNING${NC} (Found $ANY_COUNT 'any' types)"
fi

echo ""

# 6. Check for TODO/FIXME comments
echo "6. TODO/FIXME Comments"
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|BUG" src | wc -l)
if [ "$TODO_COUNT" -eq 0 ]; then
    echo -e "No TODOs... ${GREEN}✓ PASSED${NC}"
else
    echo -e "No TODOs... ${YELLOW}⚠ WARNING${NC} (Found $TODO_COUNT TODO/FIXME comments)"
fi

echo ""

# 7. Check dependencies
echo "7. Dependency Audit"
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    echo -e "Security Audit... ${GREEN}✓ PASSED${NC}"
else
    echo -e "Security Audit... ${YELLOW}⚠ WARNING${NC} (Run 'npm audit' for details)"
fi

echo ""

# 8. Bundle size check (if build exists)
echo "8. Bundle Size Analysis"
if [ -d ".next" ]; then
    BUNDLE_SIZE=$(du -sh .next | cut -f1)
    echo -e "Bundle Size... ${GREEN}✓${NC} Current size: $BUNDLE_SIZE"
else
    echo -e "Bundle Size... ${YELLOW}⚠ SKIPPED${NC} (No build found)"
fi

echo ""

# Summary
echo "================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All quality checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some quality checks failed!${NC}"
    echo "Please fix the issues before committing."
    exit 1
fi