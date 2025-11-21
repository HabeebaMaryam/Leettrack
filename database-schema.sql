-- LeetTrack Database Schema
-- This file contains all the SQL queries needed to set up the database on your local PostgreSQL

-- ============================================
-- Drop existing tables if they exist (CAREFUL: This will delete all data!)
-- ============================================
-- Uncomment the lines below only if you want to start fresh
-- DROP TABLE IF EXISTS "stats" CASCADE;
-- DROP TABLE IF EXISTS "batches" CASCADE;
-- DROP TABLE IF EXISTS "users" CASCADE;
-- DROP TABLE IF EXISTS "session" CASCADE;

-- ============================================
-- Create Tables
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "leetcode_username" TEXT,
    "role" TEXT DEFAULT 'student' NOT NULL,
    "joined_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT "users_username_unique" UNIQUE("username"),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Stats table (for LeetCode statistics)
CREATE TABLE IF NOT EXISTS "stats" (
    "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "total_solved" INTEGER DEFAULT 0 NOT NULL,
    "easy_solved" INTEGER DEFAULT 0 NOT NULL,
    "medium_solved" INTEGER DEFAULT 0 NOT NULL,
    "hard_solved" INTEGER DEFAULT 0 NOT NULL,
    "acceptance_rate" TEXT,
    "ranking" INTEGER,
    "contest_rating" INTEGER,
    "recent_submissions" JSONB DEFAULT '[]'::JSONB,
    "last_updated" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Batches table
CREATE TABLE IF NOT EXISTS "batches" (
    "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "batch_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "rank_start" INTEGER,
    "rank_end" INTEGER,
    "student_ids" JSONB DEFAULT '[]'::JSONB,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Session table (for express-session with connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
);

-- ============================================
-- Create Foreign Keys
-- ============================================
ALTER TABLE "stats" 
ADD CONSTRAINT "stats_user_id_users_id_fk" 
FOREIGN KEY ("user_id") 
REFERENCES "public"."users"("id") 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Index on session expiration for cleanup
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Index on user email for faster login queries
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");

-- Index on user_id in stats for faster lookups
CREATE INDEX IF NOT EXISTS "idx_stats_user_id" ON "stats" ("user_id");

-- ============================================
-- Sample Data: Create Default Admin User
-- ============================================
-- Password is 'admin123' (bcrypt hashed)
-- WARNING: Change this password immediately after first login!

INSERT INTO "users" ("username", "email", "password", "department", "role")
VALUES (
    'admin',
    'admin@leettrack.com',
    '$2b$10$E9/JDKORiQKAdV2WoZ.ty.D8uxfXlxyXzfUi9RJxi6707iFklzcAq', -- Password: admin123
    'IT Department',
    'admin'
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count users
SELECT COUNT(*) as user_count FROM users;

-- View all users (without passwords)
SELECT id, username, email, department, leetcode_username, role, joined_at 
FROM users 
ORDER BY joined_at DESC;

-- ============================================
-- Notes
-- ============================================
-- 1. Make sure PostgreSQL is running before executing this script
-- 2. Create a database named 'leettrack' first: CREATE DATABASE leettrack;
-- 3. Connect to the database: \c leettrack
-- 4. Run this script: \i database-schema.sql
-- 5. For the admin user password, you need to use bcrypt to hash it.
--    Run the Node.js script we created: npx tsx scripts/setup-admin.ts
