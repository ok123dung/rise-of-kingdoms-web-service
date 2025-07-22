#!/bin/bash

echo "🚀 Deploying Rise of Kingdoms Services to Production"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    print_status "Checking dependencies..."
    
    local deps=("node" "npm" "npx" "git")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            missing_deps+=($dep)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Validate environment
validate_environment() {
    print_status "Validating environment..."
    
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_status "Please copy .env.production.example and fill in the values"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the right directory?"
        exit 1
    fi
    
    print_success "Environment validation passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if npm ci --production=false; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Run tests (if any)
run_tests() {
    print_status "Running tests..."
    
    # Check if test script exists
    if npm run --silent 2>/dev/null | grep -q "test"; then
        if npm test; then
            print_success "All tests passed"
        else
            print_error "Tests failed"
            exit 1
        fi
    else
        print_warning "No tests found, skipping..."
    fi
}

# Build application
build_application() {
    print_status "Building application..."
    
    # Generate Prisma client first
    if npx prisma generate; then
        print_success "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Build Next.js app
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Database setup
setup_database() {
    print_status "Setting up database..."
    
    print_warning "Please ensure your production database is ready and DATABASE_URL is configured"
    read -p "Have you configured the production database? (y/N): " confirm
    
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_error "Please setup your production database first"
        print_status "Recommended: Use Supabase or Railway PostgreSQL"
        print_status "1. Create database instance"
        print_status "2. Update DATABASE_URL in your deployment platform"
        print_status "3. Run: npx prisma migrate deploy"
        exit 1
    fi
    
    print_success "Database setup confirmed"
}

# Git setup
prepare_git() {
    print_status "Preparing Git repository..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit: Rise of Kingdoms Services"
    else
        print_status "Git repository already exists"
        
        # Check for uncommitted changes
        if ! git diff-index --quiet HEAD --; then
            print_status "Committing changes..."
            git add .
            git commit -m "Production deployment preparation"
        fi
    fi
    
    print_success "Git repository ready"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    print_status "Starting Vercel deployment..."
    print_warning "Make sure to:"
    print_warning "1. Configure environment variables in Vercel dashboard"
    print_warning "2. Add rokdbot.com as custom domain"
    print_warning "3. Enable automatic deployments from Git"
    
    # Deploy
    if vercel --prod; then
        print_success "Deployed to Vercel successfully!"
    else
        print_error "Vercel deployment failed"
        exit 1
    fi
}

# Post-deployment checks
post_deployment_checks() {
    print_status "Running post-deployment checks..."
    
    print_status "Please manually verify:"
    echo "  ✓ https://rokdbot.com loads correctly"
    echo "  ✓ API endpoints work: https://rokdbot.com/api/health"
    echo "  ✓ Services page: https://rokdbot.com/services"
    echo "  ✓ Strategy page: https://rokdbot.com/services/strategy"
    echo "  ✓ SSL certificate is active"
    echo "  ✓ Environment variables are configured"
    echo "  ✓ Database connection is working"
    
    print_status "Recommended next steps:"
    echo "  1. Test payment workflows in sandbox mode"
    echo "  2. Set up monitoring with Sentry"
    echo "  3. Configure Google Analytics"
    echo "  4. Test contact forms and lead generation"
    echo "  5. Launch beta with first customers"
    
    print_success "Deployment completed!"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed!"
        print_status "Check the logs above for details"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment flow
main() {
    print_status "Starting deployment process..."
    
    check_dependencies
    validate_environment
    install_dependencies
    run_tests
    build_application
    setup_database
    prepare_git
    
    # Ask for confirmation before deploying
    echo
    print_warning "Ready to deploy to production!"
    read -p "Continue with deployment? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        deploy_to_vercel
        post_deployment_checks
    else
        print_status "Deployment cancelled by user"
        exit 0
    fi
}

# Run main function
main "$@"