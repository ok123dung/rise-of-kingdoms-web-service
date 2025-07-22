-- Performance indexes for Rise of Kingdoms Services database
-- These indexes will improve query performance for common operations

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created_at ON bookings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_tier_id ON bookings(service_tier_id);

-- Payments table indexes  
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_paid_at ON payments(status, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_status_lead_score ON leads(status, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source_status ON leads(source, status);
CREATE INDEX IF NOT EXISTS idx_leads_service_interest ON leads(service_interest);

-- Communications table indexes
CREATE INDEX IF NOT EXISTS idx_communications_user_id_sent_at ON communications(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_booking_id ON communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_type_status ON communications(type, status);

-- Service tiers indexes
CREATE INDEX IF NOT EXISTS idx_service_tiers_service_id_popular ON service_tiers(service_id, is_popular);
CREATE INDEX IF NOT EXISTS idx_service_tiers_available_sort ON service_tiers(is_available, sort_order);
CREATE INDEX IF NOT EXISTS idx_service_tiers_price ON service_tiers(price);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_active_featured ON services(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_services_category_sort ON services(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status_last_login ON users(status, last_login DESC);
CREATE INDEX IF NOT EXISTS idx_users_rok_kingdom_power ON users(rok_kingdom, rok_power DESC);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_active ON staff(role, is_active);

-- Accounts and Sessions indexes (NextAuth)
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);