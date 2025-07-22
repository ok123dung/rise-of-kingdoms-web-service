#!/bin/bash

echo "🚨 Fixing Critical Issues for Production..."

# 1. Generate Prisma migration for password field
echo "📦 Creating database migration..."
npx prisma migrate dev --name add-password-and-auth-models --create-only

# 2. Apply migration
echo "🔄 Applying migration..."
npx prisma migrate deploy

# 3. Generate Prisma client
echo "🏗️ Generating Prisma client..."
npx prisma generate

# 4. Install missing dependencies
echo "📦 Installing security dependencies..."
npm install bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken

# 5. Create indexes
echo "📊 Creating database indexes..."
cat > prisma/migrations/add_indexes/migration.sql << EOF
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_tier_id ON bookings(service_tier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
EOF

# 6. Run the index migration
npx prisma db execute --file prisma/migrations/add_indexes/migration.sql

echo "✅ Critical issues fixed!"
echo ""
echo "⚠️ Next steps:"
echo "1. Update .env with all required variables"
echo "2. Test authentication flow"
echo "3. Verify payment webhook signatures"
echo "4. Run security audit: npm audit"
echo "5. Test rate limiting on API routes"