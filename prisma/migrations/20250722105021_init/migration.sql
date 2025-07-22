-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "discord_username" TEXT,
    "discord_id" TEXT,
    "rok_player_id" TEXT,
    "rok_kingdom" TEXT,
    "rok_power" BIGINT,
    "preferred_language" TEXT NOT NULL DEFAULT 'vi',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "status" TEXT NOT NULL DEFAULT 'active',
    "email_verified" DATETIME,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "base_price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "service_tiers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "original_price" DECIMAL,
    "features" JSONB NOT NULL,
    "limitations" JSONB,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "max_customers" INTEGER,
    "current_customers" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "service_tiers_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_tier_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL NOT NULL,
    "discount_amount" DECIMAL NOT NULL DEFAULT 0,
    "final_amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "booking_details" JSONB,
    "customer_requirements" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "assigned_staff_id" TEXT,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "customer_rating" INTEGER,
    "customer_feedback" TEXT,
    "internal_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_service_tier_id_fkey" FOREIGN KEY ("service_tier_id") REFERENCES "service_tiers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "payment_number" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "payment_method" TEXT NOT NULL,
    "payment_gateway" TEXT NOT NULL,
    "gateway_transaction_id" TEXT,
    "gateway_order_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "gateway_response" JSONB,
    "paid_at" DATETIME,
    "refunded_at" DATETIME,
    "refund_amount" DECIMAL NOT NULL DEFAULT 0,
    "refund_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "communications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "type" TEXT NOT NULL,
    "channel" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "template_id" TEXT,
    "template_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" DATETIME,
    "delivered_at" DATETIME,
    "read_at" DATETIME,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "communications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "communications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "full_name" TEXT,
    "service_interest" TEXT,
    "source" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assigned_to" TEXT,
    "notes" TEXT,
    "converted_at" DATETIME,
    "converted_booking_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_converted_booking_id_fkey" FOREIGN KEY ("converted_booking_id") REFERENCES "bookings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB,
    "specializations" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hire_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "service_tiers_service_id_slug_key" ON "service_tiers"("service_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "leads_converted_booking_id_key" ON "leads"("converted_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
