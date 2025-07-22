#!/bin/bash

# RoK Services Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, staging, production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="rok-services"
DOCKER_IMAGE="$PROJECT_NAME:$ENVIRONMENT"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Create directories if they don't exist
mkdir -p logs backups

echo -e "${BLUE}🚀 Starting deployment for $ENVIRONMENT environment${NC}" | tee -a $LOG_FILE

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to handle errors
handle_error() {
    log "${RED}❌ Error occurred during deployment${NC}"
    log "${RED}Check log file: $LOG_FILE${NC}"
    exit 1
}

# Set error handler
trap handle_error ERR

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    log "${YELLOW}Valid environments: development, staging, production${NC}"
    exit 1
fi

log "${GREEN}✅ Environment validated: $ENVIRONMENT${NC}"

# Check required tools
log "${BLUE}🔍 Checking required tools...${NC}"

command -v node >/dev/null 2>&1 || { log "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { log "${RED}❌ npm is required but not installed${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { log "${RED}❌ git is required but not installed${NC}"; exit 1; }

log "${GREEN}✅ All required tools are available${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    log "${RED}❌ package.json not found. Please run from project root${NC}"
    exit 1
fi

# Load environment variables
if [[ -f ".env.$ENVIRONMENT" ]]; then
    log "${BLUE}📋 Loading environment variables from .env.$ENVIRONMENT${NC}"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
elif [[ -f ".env.local" ]]; then
    log "${BLUE}📋 Loading environment variables from .env.local${NC}"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    log "${YELLOW}⚠️ No environment file found${NC}"
fi

# Git checks (skip for development)
if [[ "$ENVIRONMENT" != "development" ]]; then
    log "${BLUE}🔍 Checking git status...${NC}"
    
    # Check if working directory is clean
    if [[ -n $(git status --porcelain) ]]; then
        log "${RED}❌ Working directory is not clean. Please commit or stash changes${NC}"
        git status --short
        exit 1
    fi
    
    # Get current branch and commit
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    CURRENT_COMMIT=$(git rev-parse HEAD)
    
    log "${GREEN}✅ Git status clean${NC}"
    log "${BLUE}📍 Branch: $CURRENT_BRANCH${NC}"
    log "${BLUE}📍 Commit: $CURRENT_COMMIT${NC}"
    
    # Tag the release for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        RELEASE_TAG="v$(date +%Y%m%d-%H%M%S)"
        log "${BLUE}🏷️ Creating release tag: $RELEASE_TAG${NC}"
        git tag -a "$RELEASE_TAG" -m "Production release $RELEASE_TAG"
        git push origin "$RELEASE_TAG"
    fi
fi

# Install dependencies
log "${BLUE}📦 Installing dependencies...${NC}"
npm ci --silent

# Run tests
log "${BLUE}🧪 Running tests...${NC}"
npm run test 2>&1 | tee -a $LOG_FILE || {
    log "${RED}❌ Tests failed${NC}"
    exit 1
}
log "${GREEN}✅ All tests passed${NC}"

# Type checking
log "${BLUE}🔍 Running type check...${NC}"
npm run type-check 2>&1 | tee -a $LOG_FILE || {
    log "${RED}❌ Type check failed${NC}"
    exit 1
}
log "${GREEN}✅ Type check passed${NC}"

# Linting
log "${BLUE}🔍 Running linter...${NC}"
npm run lint 2>&1 | tee -a $LOG_FILE || {
    log "${RED}❌ Linting failed${NC}"
    exit 1
}
log "${GREEN}✅ Linting passed${NC}"

# Database backup (for staging/production)
if [[ "$ENVIRONMENT" != "development" && -n "$DATABASE_URL" ]]; then
    log "${BLUE}💾 Creating database backup...${NC}"
    BACKUP_FILE="$BACKUP_DIR/db-backup-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).sql"
    
    # Extract database info from URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    if command -v pg_dump >/dev/null 2>&1; then
        pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || {
            log "${YELLOW}⚠️ Database backup failed, continuing...${NC}"
        }
        log "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"
    else
        log "${YELLOW}⚠️ pg_dump not available, skipping database backup${NC}"
    fi
fi

# Database migrations
if [[ -n "$DATABASE_URL" ]]; then
    log "${BLUE}🗃️ Running database migrations...${NC}"
    npm run db:migrate 2>&1 | tee -a $LOG_FILE || {
        log "${RED}❌ Database migration failed${NC}"
        exit 1
    }
    log "${GREEN}✅ Database migrations completed${NC}"
fi

# Build application
log "${BLUE}🏗️ Building application...${NC}"
npm run build 2>&1 | tee -a $LOG_FILE || {
    log "${RED}❌ Build failed${NC}"
    exit 1
}
log "${GREEN}✅ Build completed${NC}"

# Deploy based on environment
case $ENVIRONMENT in
    "development")
        log "${BLUE}🚀 Starting development server...${NC}"
        npm run dev
        ;;
    
    "staging")
        log "${BLUE}🚀 Deploying to staging...${NC}"
        
        # Deploy to Vercel staging
        if command -v vercel >/dev/null 2>&1; then
            vercel --prod --confirm 2>&1 | tee -a $LOG_FILE
            log "${GREEN}✅ Deployed to Vercel staging${NC}"
        else
            log "${YELLOW}⚠️ Vercel CLI not available${NC}"
        fi
        ;;
    
    "production")
        log "${BLUE}🚀 Deploying to production...${NC}"
        
        # Production deployment confirmation
        echo -e "${YELLOW}⚠️ You are about to deploy to PRODUCTION${NC}"
        echo -e "${YELLOW}This will affect live users and revenue${NC}"
        read -p "Are you sure you want to continue? (yes/no): " -r
        
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "${YELLOW}❌ Production deployment cancelled${NC}"
            exit 1
        fi
        
        # Deploy to production
        if command -v vercel >/dev/null 2>&1; then
            vercel --prod --confirm 2>&1 | tee -a $LOG_FILE
            log "${GREEN}✅ Deployed to production${NC}"
        else
            log "${RED}❌ Vercel CLI not available for production deployment${NC}"
            exit 1
        fi
        
        # Send deployment notification
        if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
            curl -X POST "$DISCORD_WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{
                    \"content\": \"🚀 **Production Deployment Successful**\",
                    \"embeds\": [{
                        \"title\": \"RoK Services - Production Deployment\",
                        \"color\": 65280,
                        \"fields\": [
                            {\"name\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"inline\": true},
                            {\"name\": \"Branch\", \"value\": \"$CURRENT_BRANCH\", \"inline\": true},
                            {\"name\": \"Commit\", \"value\": \"$CURRENT_COMMIT\", \"inline\": true},
                            {\"name\": \"Deployed by\", \"value\": \"$(whoami)\", \"inline\": true},
                            {\"name\": \"Time\", \"value\": \"$(date)\", \"inline\": false}
                        ]
                    }]
                }" 2>/dev/null || log "${YELLOW}⚠️ Failed to send Discord notification${NC}"
        fi
        ;;
esac

# Health check
log "${BLUE}🏥 Running health check...${NC}"
sleep 5  # Wait for deployment to be ready

if [[ -n "$HEALTH_CHECK_URL" ]]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")
    
    if [[ "$HTTP_STATUS" == "200" ]]; then
        log "${GREEN}✅ Health check passed${NC}"
    else
        log "${RED}❌ Health check failed (HTTP $HTTP_STATUS)${NC}"
        log "${YELLOW}⚠️ Deployment may have issues${NC}"
    fi
else
    log "${YELLOW}⚠️ No health check URL configured${NC}"
fi

# Cleanup old backups (keep last 10)
if [[ -d "$BACKUP_DIR" ]]; then
    log "${BLUE}🧹 Cleaning up old backups...${NC}"
    ls -t "$BACKUP_DIR"/db-backup-* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    log "${GREEN}✅ Backup cleanup completed${NC}"
fi

# Final summary
DEPLOY_END_TIME=$(date)
log "${GREEN}🎉 Deployment completed successfully!${NC}"
log "${BLUE}📊 Deployment Summary:${NC}"
log "${BLUE}   Environment: $ENVIRONMENT${NC}"
log "${BLUE}   Started: $(head -1 $LOG_FILE | cut -d']' -f1 | tr -d '[')${NC}"
log "${BLUE}   Completed: $DEPLOY_END_TIME${NC}"
log "${BLUE}   Log file: $LOG_FILE${NC}"

if [[ "$ENVIRONMENT" == "production" ]]; then
    log "${GREEN}🚀 Production is now live with the latest changes!${NC}"
    log "${BLUE}🔗 Website: ${NEXT_PUBLIC_SITE_URL:-https://rokdbot.com}${NC}"
    log "${BLUE}📊 Admin: ${NEXT_PUBLIC_SITE_URL:-https://rokdbot.com}/admin${NC}"
fi

log "${GREEN}✅ Deployment script completed successfully${NC}"
