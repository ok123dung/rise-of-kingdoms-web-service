#!/bin/bash

echo "🚀 Setting up Railway PostgreSQL Database"
echo "========================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment variables"
    echo ""
    echo "Please set your DATABASE_URL from Railway:"
    echo "1. Go to your Railway dashboard"
    echo "2. Click on your PostgreSQL service"
    echo "3. Go to the 'Variables' tab"
    echo "4. Copy the DATABASE_URL value"
    echo "5. Add it to your .env file"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Try to connect to database
echo ""
echo "🔗 Testing database connection..."
npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database connection successful!"
    echo "✅ Schema has been pushed to database"
    
    # Seed database (optional)
    if [ -f "prisma/seed.ts" ]; then
        echo ""
        echo "🌱 Seeding database..."
        npx prisma db seed
    fi
else
    echo ""
    echo "❌ Database connection failed!"
    echo ""
    echo "Common issues:"
    echo "1. Wrong credentials - Check your Railway dashboard"
    echo "2. Database is sleeping - Wake it up in Railway"
    echo "3. Firewall blocking connection - Check Railway settings"
    echo ""
    echo "Your current DATABASE_URL starts with:"
    echo "${DATABASE_URL:0:50}..."
fi

echo ""
echo "📝 Next steps:"
echo "1. If connection failed, update your DATABASE_URL in .env"
echo "2. Run this script again: bash scripts/setup-database.sh"
echo "3. Start your development server: npm run dev"