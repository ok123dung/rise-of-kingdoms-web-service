-- Add critical performance indexes for Rise of Kingdoms Services
-- These indexes will significantly improve query performance

-- Booking indexes
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_status_created ON bookings(status, created_at);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_staff_status ON bookings(assigned_staff_id, status);

-- Payment indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);
CREATE INDEX idx_payments_gateway_status ON payments(payment_gateway, status);

-- Lead indexes
CREATE INDEX idx_leads_status_created ON leads(status, created_at);
CREATE INDEX idx_leads_assigned_status ON leads(assigned_to, status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- Communication indexes
CREATE INDEX idx_communications_user_created ON communications(user_id, created_at);
CREATE INDEX idx_communications_booking ON communications(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_communications_status_type ON communications(status, type);

-- User indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_users_kingdom ON users(rok_kingdom) WHERE rok_kingdom IS NOT NULL;

-- ServiceTier indexes
CREATE INDEX idx_service_tiers_service_available ON service_tiers(service_id, is_available);
CREATE INDEX idx_service_tiers_available_sort ON service_tiers(is_available, sort_order);