-- =====================================================
-- RoK Services Database Field-Level Encryption
-- Safe version with error handling
-- =====================================================

-- Enable pgcrypto extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- Create Encryption Schema and Tables (Safe)
-- =====================================================

-- Create vault schema if not exists
CREATE SCHEMA IF NOT EXISTS vault;

-- Create encryption keys table if not exists
CREATE TABLE IF NOT EXISTS vault.encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- Drop and Recreate Encryption Functions
-- =====================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS vault.encrypt_sensitive(TEXT, TEXT);
DROP FUNCTION IF EXISTS vault.decrypt_sensitive(TEXT, TEXT);

-- Function to encrypt sensitive text data
CREATE FUNCTION vault.encrypt_sensitive(
    plain_text TEXT,
    key_name TEXT DEFAULT 'main'
) RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
BEGIN
    -- Handle NULL input
    IF plain_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get active encryption key
    SELECT key_value INTO encryption_key
    FROM vault.encryption_keys
    WHERE encryption_keys.key_name = encrypt_sensitive.key_name
    AND is_active = true
    LIMIT 1;
    
    IF encryption_key IS NULL THEN
        -- Create a default key if none exists
        INSERT INTO vault.encryption_keys (key_name, key_value)
        VALUES (encrypt_sensitive.key_name, encode(gen_random_bytes(32), 'base64'))
        ON CONFLICT (key_name) DO UPDATE SET is_active = true
        RETURNING key_value INTO encryption_key;
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
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Encryption failed: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive text data
CREATE FUNCTION vault.decrypt_sensitive(
    encrypted_text TEXT,
    key_name TEXT DEFAULT 'main'
) RETURNS TEXT AS $$
DECLARE
    encryption_key TEXT;
    decrypted_text TEXT;
BEGIN
    -- Handle NULL input
    IF encrypted_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get encryption key
    SELECT key_value INTO encryption_key
    FROM vault.encryption_keys
    WHERE encryption_keys.key_name = decrypt_sensitive.key_name
    LIMIT 1;
    
    IF encryption_key IS NULL THEN
        RAISE WARNING 'Encryption key not found: %', key_name;
        RETURN NULL;
    END IF;
    
    -- Try to decrypt
    BEGIN
        decrypted_text := pgp_sym_decrypt(
            decode(encrypted_text, 'base64'),
            encryption_key
        );
        RETURN decrypted_text;
    EXCEPTION WHEN OTHERS THEN
        -- Try with other keys if rotation happened
        FOR encryption_key IN 
            SELECT key_value 
            FROM vault.encryption_keys 
            WHERE encryption_keys.key_name = decrypt_sensitive.key_name
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
        
        RAISE WARNING 'Unable to decrypt data: %', SQLERRM;
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Add Encrypted Columns (Safe)
-- =====================================================

DO $$
BEGIN
    -- Users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_encrypted') THEN
        ALTER TABLE users ADD COLUMN phone_encrypted TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'discord_id_encrypted') THEN
        ALTER TABLE users ADD COLUMN discord_id_encrypted TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'rok_player_id_encrypted') THEN
        ALTER TABLE users ADD COLUMN rok_player_id_encrypted TEXT;
    END IF;
    
    -- Payments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'gateway_transaction_id_encrypted') THEN
        ALTER TABLE payments ADD COLUMN gateway_transaction_id_encrypted TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'metadata_encrypted') THEN
        ALTER TABLE payments ADD COLUMN metadata_encrypted TEXT;
    END IF;
    
    -- Communications table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'content_encrypted') THEN
        ALTER TABLE communications ADD COLUMN content_encrypted TEXT;
    END IF;
    
    -- File uploads table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'file_uploads' AND column_name = 'metadata_encrypted') THEN
        ALTER TABLE file_uploads ADD COLUMN metadata_encrypted TEXT;
    END IF;
    
    RAISE NOTICE 'Encrypted columns added successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error adding encrypted columns: %', SQLERRM;
END $$;

-- =====================================================
-- Create Secure Views (Drop and Recreate)
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS public.users_secure;
DROP VIEW IF EXISTS public.payments_secure;

-- Users view with encrypted sensitive fields
CREATE VIEW public.users_secure AS
SELECT 
    id,
    email,
    name,
    -- Decrypt phone only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN COALESCE(vault.decrypt_sensitive(phone_encrypted), phone)
        ELSE NULL
    END as phone,
    -- Decrypt discord_id only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN COALESCE(vault.decrypt_sensitive(discord_id_encrypted), discord_id)
        ELSE NULL
    END as discord_id,
    -- Decrypt rok_player_id only for authorized users
    CASE 
        WHEN auth.uid()::text = id OR 
             EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()::text AND role IN ('admin', 'manager'))
        THEN COALESCE(vault.decrypt_sensitive(rok_player_id_encrypted), rok_player_id)
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
CREATE VIEW public.payments_secure AS
SELECT 
    id,
    booking_id,
    amount,
    currency,
    status,
    payment_gateway,
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
        THEN COALESCE(vault.decrypt_sensitive(gateway_transaction_id_encrypted), gateway_transaction_id)
        ELSE NULL
    END as gateway_transaction_id,
    payment_number,
    paid_at,
    created_at,
    updated_at
FROM payments;

-- =====================================================
-- Migration Function (Safe)
-- =====================================================

-- Drop existing function
DROP FUNCTION IF EXISTS vault.migrate_encrypt_sensitive_data();

-- Function to migrate existing unencrypted data
CREATE FUNCTION vault.migrate_encrypt_sensitive_data()
RETURNS void AS $$
DECLARE
    row_count INTEGER := 0;
BEGIN
    -- Initialize encryption key if not exists
    INSERT INTO vault.encryption_keys (key_name, key_value)
    VALUES ('main', encode(gen_random_bytes(32), 'base64'))
    ON CONFLICT (key_name) DO NOTHING;
    
    -- Encrypt user data
    UPDATE users 
    SET 
        phone_encrypted = vault.encrypt_sensitive(phone),
        discord_id_encrypted = vault.encrypt_sensitive(discord_id),
        rok_player_id_encrypted = vault.encrypt_sensitive(rok_player_id)
    WHERE (phone IS NOT NULL OR discord_id IS NOT NULL OR rok_player_id IS NOT NULL)
    AND (phone_encrypted IS NULL OR discord_id_encrypted IS NULL OR rok_player_id_encrypted IS NULL);
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Encrypted % user records', row_count;
    
    -- Encrypt payment data
    UPDATE payments
    SET 
        gateway_transaction_id_encrypted = vault.encrypt_sensitive(gateway_transaction_id),
        metadata_encrypted = vault.encrypt_sensitive(metadata::text)
    WHERE (gateway_transaction_id IS NOT NULL OR metadata IS NOT NULL)
    AND (gateway_transaction_id_encrypted IS NULL OR metadata_encrypted IS NULL);
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Encrypted % payment records', row_count;
    
    -- Encrypt communication content
    UPDATE communications
    SET content_encrypted = vault.encrypt_sensitive(content)
    WHERE content IS NOT NULL
    AND content_encrypted IS NULL;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Encrypted % communication records', row_count;
    
    -- Encrypt file metadata
    UPDATE file_uploads
    SET metadata_encrypted = vault.encrypt_sensitive(metadata::text)
    WHERE metadata IS NOT NULL
    AND metadata_encrypted IS NULL;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Encrypted % file upload records', row_count;
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Migration error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Automatic Encryption Triggers (Safe)
-- =====================================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS encrypt_user_data ON users;
DROP TRIGGER IF EXISTS encrypt_payment_data ON payments;
DROP FUNCTION IF EXISTS vault.encrypt_user_trigger();
DROP FUNCTION IF EXISTS vault.encrypt_payment_trigger();

-- Trigger function to encrypt user data on insert/update
CREATE FUNCTION vault.encrypt_user_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone_encrypted IS NULL THEN
        NEW.phone_encrypted = vault.encrypt_sensitive(NEW.phone);
    END IF;
    
    IF NEW.discord_id IS NOT NULL AND NEW.discord_id_encrypted IS NULL THEN
        NEW.discord_id_encrypted = vault.encrypt_sensitive(NEW.discord_id);
    END IF;
    
    IF NEW.rok_player_id IS NOT NULL AND NEW.rok_player_id_encrypted IS NULL THEN
        NEW.rok_player_id_encrypted = vault.encrypt_sensitive(NEW.rok_player_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER encrypt_user_data
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION vault.encrypt_user_trigger();

-- Trigger for payment encryption
CREATE FUNCTION vault.encrypt_payment_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.gateway_transaction_id IS NOT NULL AND NEW.gateway_transaction_id_encrypted IS NULL THEN
        NEW.gateway_transaction_id_encrypted = vault.encrypt_sensitive(NEW.gateway_transaction_id);
    END IF;
    
    IF NEW.metadata IS NOT NULL AND NEW.metadata_encrypted IS NULL THEN
        NEW.metadata_encrypted = vault.encrypt_sensitive(NEW.metadata::text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_payment_data
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION vault.encrypt_payment_trigger();

-- =====================================================
-- Access Control (Safe)
-- =====================================================

-- Grant permissions
GRANT USAGE ON SCHEMA vault TO authenticated;
GRANT EXECUTE ON FUNCTION vault.encrypt_sensitive TO authenticated;
GRANT EXECUTE ON FUNCTION vault.decrypt_sensitive TO authenticated;

-- Revoke direct access to encryption keys table
REVOKE ALL ON vault.encryption_keys FROM PUBLIC;
REVOKE ALL ON vault.encryption_keys FROM authenticated;

-- =====================================================
-- Data Classification Table (Safe)
-- =====================================================

-- Create table if not exists
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

-- Insert classification data
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
    ('security_logs', 'ip', 'confidential', 'identifier', false, 90)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Compliance View (Safe)
-- =====================================================

-- Drop and recreate
DROP VIEW IF EXISTS public.encryption_compliance;

CREATE VIEW public.encryption_compliance AS
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
        THEN '✅ Compliant'
        WHEN dc.encryption_required THEN '❌ Non-Compliant'
        ELSE '➖ N/A'
    END as compliance_status
FROM data_classification dc
ORDER BY dc.classification DESC, dc.table_name, dc.column_name;

-- =====================================================
-- Summary
-- =====================================================

DO $$
DECLARE
    encrypted_count INTEGER;
    key_count INTEGER;
BEGIN
    -- Count encrypted columns
    SELECT COUNT(*) INTO encrypted_count
    FROM information_schema.columns
    WHERE column_name LIKE '%_encrypted'
    AND table_schema = 'public';
    
    -- Count encryption keys
    SELECT COUNT(*) INTO key_count
    FROM vault.encryption_keys
    WHERE is_active = true;
    
    RAISE NOTICE 'Field-level encryption setup complete!';
    RAISE NOTICE 'Encrypted columns: %', encrypted_count;
    RAISE NOTICE 'Active encryption keys: %', key_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Run SELECT vault.migrate_encrypt_sensitive_data() to encrypt existing data';
    RAISE NOTICE 'View compliance status: SELECT * FROM encryption_compliance';
END $$;