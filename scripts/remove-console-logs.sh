#!/bin/bash

# Script to find and help replace console.log statements with proper logging

echo "Finding all console.log, console.warn, console.error statements in src directory..."
echo "=================================================="

# Find all console statements
echo "Files with console statements:"
grep -r "console\.\(log\|warn\|error\)" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | cut -d: -f1 | sort | uniq -c

echo ""
echo "Detailed breakdown:"
echo "=================================================="

# Show detailed lines
grep -rn "console\.\(log\|warn\|error\)" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -50

echo ""
echo "Summary:"
echo "=================================================="

# Count by type
echo "console.log count: $(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)"
echo "console.warn count: $(grep -r "console\.warn" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)" 
echo "console.error count: $(grep -r "console\.error" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)"

echo ""
echo "To replace these:"
echo "1. In server-side code: import { getLogger } from '@/lib/monitoring/logger'"
echo "2. In client-side code: import { clientLogger } from '@/lib/client-logger'"
echo "3. Replace console.log with logger.info or logger.debug"
echo "4. Replace console.error with logger.error"
echo "5. Replace console.warn with logger.warn"