-- =====================================================
-- RoK Services Database Field-Level Encryption
-- Sensitive Data Protection Implementation
-- =====================================================

-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- Create Encryption Key Management
-- =====================================================

-- Create a secure schema for encryption utilities
CREATE SCHEMA IF NOT EXISTS vault;

-- Create table to store encryption keys (managed by Supabase Vault)
CREATE TABLE IF NOT EXISTS vault.encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT NOT NULL UNIQUE,
    key_value TEXT NOT NULL, -- This will be encrypted by Supabase Vault
    created_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- Encryption/Decryption Functions
-- =====================================================

-- Function to encrypt sensitive text data
CREATE OR REPLACE FUNCTION vault.encrypt_sensitive(
    plain_text TEXT,
    key_name TEXT DEFAULT 'main'
) RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
BEGIN
    -- Get active encryption key
    SELECT key_value INTO encryption_key
    FROM vault.encryption_keys
    WHERE key_name = encrypt_sensitive.key_name
    AND is_active = true
    LIMIT 1;
    
    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Encryption key not found: %', key_name;
    END IF;
    
    -- Encrypt the data
    RETURN encode(
        pgp_sym_encrypt(
            plain_text,
            encryption_key,
            'cipher-algo=aes256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive text data
CREATE OR REPLACE FUNCTION vault.decrypt_sensitive(
    encrypted_text TEXT,
    key_name TEXT DEFAULT 'main'
) RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    decrypted_text TEXT;
BEGIN
    -- Get encryption key
    SELECT key_value INTO encryption_key
    FROM vault.encryption_keys
    WHERE key_name = decrypt_sensitive.key_name
    LIMIT 1;
    
    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Encryption key not found: %', key_name;
    END IF;
    
    -- Try to decrypt with current key
    BEGIN
        decrypted_text := pgp_sym_decrypt(
            decode(encrypted_text, 'base64'),
            encryption_key
        );
        RETURN decrypted_text;
    EXCEPTION WHEN OTHERS THEN
        -- If fails, try with previous keys (for key rotation)
        FOR encryption_key IN 
            SELECT key_value 
            FROM vault.encryption_keys 
            WHERE key_name = decrypt_sensitive.key_name
            ORDER BY created_at DESC
        LOOP
            BEGIN
                decrypted_text := pgp_sym_decrypt(
                    decode(encrypted_text, 'base64'),
                    encryption_key
                );
                RETURN decrypted_text;
            EXCEPTION WHEN OTHERS THEN
                CONTINUE;
            END;
        END LOOP;
        
        RAISE EXCEPTION 'Unable to decrypt data';
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Create Encrypted Views for Sensitive Data
-- =====================================================

-- Users view with encrypted sensitive fields
CREATE OR REPLACE VIEW public.users_secure AS
SELECT 
    id,
    email,
    name,
    -- Decrypt phone only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN vault.decrypt_sensitive(phone_encrypted)
        ELSE NULL
    END as phone,
    -- Decrypt discord_id only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN vault.decrypt_sensitive(discord_id_encrypted)
        ELSE NULL
    END as discord_id,
    -- Decrypt rok_player_id only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN vault.decrypt_sensitive(rok_player_id_encrypted)
        ELSE NULL
    END as rok_player_id,
    kingdom,
    server,
    alliance,
    vip_level,
    city_hall_level,
    total_power,
    status,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL;

-- Payments view with encrypted transaction IDs
CREATE OR REPLACE VIEW public.payments_secure AS
SELECT 
    id,
    booking_id,
    amount,
    currency,
    status,
    gateway,
    -- Decrypt transaction ID only for authorized users
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = payments.booking_id 
            AND b.user_id = auth.uid()::text
        ) OR EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid()::text 
            AND role IN ('admin', 'manager', 'finance')
        )
        THEN vault.decrypt_sensitive(gateway_transaction_id_encrypted)
        ELSE NULL
    END as gateway_transaction_id,
    reference_code,
    paid_at,
    created_at,
    updated_at
FROM payments;

-- =====================================================
-- Migration Functions for Existing Data
-- =====================================================

-- Function to migrate existing unencrypted data
CREATE OR REPLACE FUNCTION vault.migrate_encrypt_sensitive_data()
RETURNS void AS $$
BEGIN
    -- Add encrypted columns if they don't exist
    ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone_encrypted TEXT,
        ADD COLUMN IF NOT EXISTS discord_id_encrypted TEXT,
        ADD COLUMN IF NOT EXISTS rok_player_id_encrypted TEXT;
    
    ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS gateway_transaction_id_encrypted TEXT,
        ADD COLUMN IF NOT EXISTS metadata_encrypted TEXT;
    
    ALTER TABLE communications
        ADD COLUMN IF NOT EXISTS content_encrypted TEXT;
    
    ALTER TABLE file_uploads
        ADD COLUMN IF NOT EXISTS metadata_encrypted TEXT;
    
    -- Encrypt existing user data
    UPDATE users 
    SET 
        phone_encrypted = vault.encrypt_sensitive(phone),
        discord_id_encrypted = vault.encrypt_sensitive(discord_id),
        rok_player_id_encrypted = vault.encrypt_sensitive(rok_player_id)
    WHERE phone IS NOT NULL 
       OR discord_id IS NOT NULL 
       OR rok_player_id IS NOT NULL;
    
    -- Encrypt existing payment data
    UPDATE payments
    SET 
        gateway_transaction_id_encrypted = vault.encrypt_sensitive(gateway_transaction_id),
        metadata_encrypted = vault.encrypt_sensitive(metadata::text)
    WHERE gateway_transaction_id IS NOT NULL
       OR metadata IS NOT NULL;
    
    -- Encrypt existing communication content
    UPDATE communications
    SET content_encrypted = vault.encrypt_sensitive(content)
    WHERE content IS NOT NULL;
    
    -- Encrypt file metadata
    UPDATE file_uploads
    SET metadata_encrypted = vault.encrypt_sensitive(metadata::text)
    WHERE metadata IS NOT NULL;
    
    -- Drop original columns (after verifying encryption)
    -- NOTE: Only execute after confirming all data is encrypted
    -- ALTER TABLE users DROP COLUMN phone, DROP COLUMN discord_id, DROP COLUMN rok_player_id;
    -- ALTER TABLE payments DROP COLUMN gateway_transaction_id, DROP COLUMN metadata;
    -- ALTER TABLE communications DROP COLUMN content;
    -- ALTER TABLE file_uploads DROP COLUMN metadata;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers for Automatic Encryption
-- =====================================================

-- Trigger function to encrypt user data on insert/update
CREATE OR REPLACE FUNCTION vault.encrypt_user_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone IS NOT NULL THEN
        NEW.phone_encrypted = vault.encrypt_sensitive(NEW.phone);
        NEW.phone = NULL; -- Clear plaintext
    END IF;
    
    IF NEW.discord_id IS NOT NULL THEN
        NEW.discord_id_encrypted = vault.encrypt_sensitive(NEW.discord_id);
        NEW.discord_id = NULL; -- Clear plaintext
    END IF;
    
    IF NEW.rok_player_id IS NOT NULL THEN
        NEW.rok_player_id_encrypted = vault.encrypt_sensitive(NEW.rok_player_id);
        NEW.rok_player_id = NULL; -- Clear plaintext
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER encrypt_user_data
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION vault.encrypt_user_trigger();

-- Trigger for payment encryption
CREATE OR REPLACE FUNCTION vault.encrypt_payment_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.gateway_transaction_id IS NOT NULL THEN
        NEW.gateway_transaction_id_encrypted = vault.encrypt_sensitive(NEW.gateway_transaction_id);
        NEW.gateway_transaction_id = NULL; -- Clear plaintext
    END IF;
    
    IF NEW.metadata IS NOT NULL THEN
        NEW.metadata_encrypted = vault.encrypt_sensitive(NEW.metadata::text);
        NEW.metadata = NULL; -- Clear plaintext
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_payment_data
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION vault.encrypt_payment_trigger();

-- =====================================================
-- Access Control for Encryption Functions
-- =====================================================

-- Grant permissions
GRANT USAGE ON SCHEMA vault TO authenticated;
GRANT EXECUTE ON FUNCTION vault.encrypt_sensitive TO authenticated;
GRANT EXECUTE ON FUNCTION vault.decrypt_sensitive TO authenticated;

-- Revoke direct access to encryption keys table
REVOKE ALL ON vault.encryption_keys FROM PUBLIC;
REVOKE ALL ON vault.encryption_keys FROM authenticated;

-- =====================================================
-- Initialize Encryption Keys
-- =====================================================

-- Insert initial encryption key (This should be managed by Supabase Vault)
-- In production, use Supabase Vault to securely manage keys
INSERT INTO vault.encryption_keys (key_name, key_value)
VALUES ('main', gen_random_bytes(32)::text)
ON CONFLICT (key_name) DO NOTHING;

-- =====================================================
-- Data Classification Tags
-- =====================================================

-- Create table for data classification
CREATE TABLE IF NOT EXISTS public.data_classification (
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    classification TEXT NOT NULL CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
    pii_type TEXT CHECK (pii_type IN ('name', 'email', 'phone', 'address', 'financial', 'health', 'identifier')),
    encryption_required BOOLEAN DEFAULT false,
    retention_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (table_name, column_name)
);

-- Classify sensitive columns
INSERT INTO data_classification (table_name, column_name, classification, pii_type, encryption_required, retention_days)
VALUES 
    ('users', 'email', 'confidential', 'email', false, 2555),
    ('users', 'phone', 'restricted', 'phone', true, 2555),
    ('users', 'discord_id', 'confidential', 'identifier', true, 2555),
    ('users', 'rok_player_id', 'confidential', 'identifier', true, 2555),
    ('payments', 'gateway_transaction_id', 'restricted', 'financial', true, 2555),
    ('payments', 'metadata', 'confidential', 'financial', true, 2555),
    ('communications', 'content', 'confidential', NULL, true, 365),
    ('file_uploads', 'metadata', 'internal', NULL, true, 1095),
    ('audit_logs', 'ip_address', 'confidential', 'identifier', false, 90),
    ('security_logs', 'ip_address', 'confidential', 'identifier', false, 90)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Monitoring and Compliance
-- =====================================================

-- Create view for encryption compliance monitoring
CREATE OR REPLACE VIEW public.encryption_compliance AS
SELECT 
    dc.table_name,
    dc.column_name,
    dc.classification,
    dc.pii_type,
    dc.encryption_required,
    CASE 
        WHEN dc.encryption_required AND 
             EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = dc.table_name 
                AND column_name = dc.column_name || '_encrypted'
             )
        THEN 'Compliant'
        WHEN dc.encryption_required THEN 'Non-Compliant'
        ELSE 'N/A'
    END as compliance_status
FROM data_classification dc
ORDER BY dc.classification DESC, dc.table_name, dc.column_name;