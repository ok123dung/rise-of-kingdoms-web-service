#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Patterns to match console statements
const CONSOLE_PATTERNS = [
  /console\s*\.\s*log\s*\(/g,
  /console\s*\.\s*error\s*\(/g,
  /console\s*\.\s*warn\s*\(/g,
  /console\s*\.\s*info\s*\(/g,
  /console\s*\.\s*debug\s*\(/g,
  /console\s*\.\s*trace\s*\(/g,
  /console\s*\.\s*table\s*\(/g,
  /console\s*\.\s*time\s*\(/g,
  /console\s*\.\s*timeEnd\s*\(/g,
  /console\s*\.\s*group\s*\(/g,
  /console\s*\.\s*groupEnd\s*\(/g
]

// Directories and files to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/__tests__/**',
  '**/scripts/**',
  '**/prisma/**',
  '**/public/**',
  '**/.git/**',
  '**/coverage/**',
  '**/docs/**',
  '**/*.md',
  '**/package.json',
  '**/package-lock.json',
  '**/tsconfig.json',
  '**/.env*'
]

// Files that are allowed to have console statements
const ALLOWED_FILES = [
  'src/lib/monitoring/logger.ts',
  'src/lib/monitoring/edge-logger.ts',
  'src/lib/error-handler.ts',
  'src/app/error.tsx',
  'src/app/global-error.tsx',
  'scripts/remove-console-logs.js'
]

function removeConsoleStatements(filePath, dryRun = false) {
  // Check if file is in allowed list
  const relativePath = path.relative(process.cwd(), filePath)
  if (ALLOWED_FILES.some(allowed => relativePath.endsWith(allowed))) {
    return { path: filePath, removed: 0, skipped: true }
  }

  const content = fs.readFileSync(filePath, 'utf8')
  let modified = content
  let totalRemoved = 0

  // Track original content
  const originalContent = content

  // Remove console statements
  CONSOLE_PATTERNS.forEach(pattern => {
    const matches = modified.match(pattern) || []
    totalRemoved += matches.length

    // Complex regex to handle multi-line console statements
    const multilinePattern = new RegExp(
      pattern.source.replace(/\(/g, '\\s*\\([\\s\\S]*?\\)\\s*;?'),
      'g'
    )
    modified = modified.replace(multilinePattern, '')
  })

  // Clean up empty lines left behind
  modified = modified.replace(/^\s*\n/gm, '')

  // Fix double empty lines
  modified = modified.replace(/\n\n\n+/g, '\n\n')

  if (totalRemoved > 0 && !dryRun) {
    fs.writeFileSync(filePath, modified, 'utf8')
  }

  return {
    path: filePath,
    removed: totalRemoved,
    modified: originalContent !== modified,
    skipped: false
  }
}

function findFiles() {
  const patterns = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx']

  const files = []
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      absolute: true
    })
    files.push(...matches)
  })

  return [...new Set(files)] // Remove duplicates
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const verbose = args.includes('--verbose')

  console.log('🔍 Scanning for console statements...')
  if (dryRun) {
    console.log('🏃 Running in dry-run mode (no files will be modified)')
  }

  const files = findFiles()
  console.log(`📁 Found ${files.length} files to scan`)

  let totalRemoved = 0
  let filesModified = 0
  const results = []

  files.forEach(file => {
    const result = removeConsoleStatements(file, dryRun)
    results.push(result)

    if (result.removed > 0) {
      totalRemoved += result.removed
      filesModified++

      if (verbose) {
        console.log(`  ✓ ${result.path}: Removed ${result.removed} console statements`)
      }
    } else if (verbose && !result.skipped) {
      console.log(`  - ${result.path}: No console statements found`)
    }
  })

  console.log('\n📊 Summary:')
  console.log(`  Total files scanned: ${files.length}`)
  console.log(`  Files modified: ${filesModified}`)
  console.log(`  Console statements removed: ${totalRemoved}`)
  console.log(`  Files skipped (allowed): ${results.filter(r => r.skipped).length}`)

  if (dryRun && totalRemoved > 0) {
    console.log('\n⚠️  Run without --dry-run to apply changes')
  }

  // List files that would be modified
  if (verbose && filesModified > 0) {
    console.log('\n📝 Files with console statements:')
    results
      .filter(r => r.removed > 0)
      .forEach(r => {
        console.log(`  - ${path.relative(process.cwd(), r.path)} (${r.removed} statements)`)
      })
  }

  process.exit(0)
}

// Add support for being imported as a module
if (require.main === module) {
  main()
}

module.exports = { removeConsoleStatements, findFiles }
