# LeetTrack Database Setup Guide

This guide will help you set up the LeetTrack database on both your local machine and Replit.

## 📋 Prerequisites

- PostgreSQL installed on your local machine
- Node.js and npm installed
- Basic knowledge of terminal/command line

---

## 🏠 Local Machine Setup

### Step 1: Create the Database

Open your PostgreSQL terminal (psql) and run:

```sql
CREATE DATABASE leettrack;
```

### Step 2: Connect to the Database

```sql
\c leettrack
```

### Step 3: Run the Schema Script

Execute the provided SQL schema file:

```sql
\i database-schema.sql
```

Or copy and paste the contents of `database-schema.sql` into your psql terminal.

### Step 4: Set Environment Variables

Create a `.env` file in your project root:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/leettrack
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=5000
```

Replace `username` and `password` with your PostgreSQL credentials.

### Step 5: Verify the Setup

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `batches`
- `session`
- `stats`
- `users`

### Step 6: Create Admin User

Run the setup script:

```bash
npx tsx scripts/setup-admin.ts
```

Or use the interactive version:

```bash
npx tsx scripts/create-admin.ts
```

---

## ☁️ Replit Setup

### The database is already set up in Replit! ✅

The following has been done for you:

1. ✅ PostgreSQL database provisioned
2. ✅ All tables created (users, stats, batches, session)
3. ✅ Admin user created: `admin@leettrack.com` / `admin123`
4. ✅ Environment variables configured automatically

### To verify Replit setup:

1. Click the "Shell" tab
2. Run: `npx tsx scripts/setup-admin.ts`

---

## 🔑 Default Admin Credentials

**Email:** `admin@leettrack.com`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 📊 Database Schema Details

### Users Table
Stores user accounts with authentication

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| username | TEXT | Unique username |
| email | TEXT | Unique email address |
| password | TEXT | Bcrypt hashed password |
| department | TEXT | User's department (optional) |
| leetcode_username | TEXT | LeetCode username (optional) |
| role | TEXT | 'student' or 'admin' |
| joined_at | TIMESTAMP | Account creation time |

### Stats Table
Stores LeetCode statistics for each user

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| user_id | VARCHAR | Foreign key to users.id |
| total_solved | INTEGER | Total problems solved |
| easy_solved | INTEGER | Easy problems solved |
| medium_solved | INTEGER | Medium problems solved |
| hard_solved | INTEGER | Hard problems solved |
| acceptance_rate | TEXT | Acceptance percentage |
| ranking | INTEGER | LeetCode ranking |
| contest_rating | INTEGER | Contest rating |
| recent_submissions | JSONB | Recent submission data |
| last_updated | TIMESTAMP | Last stats update time |

### Batches Table
Manages student batches/groups

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR (UUID) | Primary key |
| batch_name | TEXT | Name of the batch |
| department | TEXT | Department name |
| rank_start | INTEGER | Starting rank range |
| rank_end | INTEGER | Ending rank range |
| student_ids | JSONB | Array of student IDs |
| created_at | TIMESTAMP | Batch creation time |

### Session Table
Stores user session data (managed by express-session)

| Column | Type | Description |
|--------|------|-------------|
| sid | VARCHAR | Session ID (primary key) |
| sess | JSON | Session data |
| expire | TIMESTAMP | Session expiration time |

---

## 🔧 Utility Scripts

### Generate Password Hash
Create a bcrypt hash for any password:

```bash
npx tsx scripts/generate-password-hash.ts yourpassword
```

### Create/Update Admin User
Non-interactive admin user creation:

```bash
npx tsx scripts/setup-admin.ts
```

Interactive admin user creation:

```bash
npx tsx scripts/create-admin.ts
```

---

## 🐛 Troubleshooting

### Issue: "relation users does not exist"
**Solution:** Run the database migrations
```bash
npm run db:push
```

### Issue: Login fails with correct credentials
**Solution:** Ensure password is bcrypt hashed, not plain text
```bash
npx tsx scripts/setup-admin.ts
```

### Issue: Session not persisting (401 errors after login)
**Solution:** Check that:
1. Session table exists in database
2. DATABASE_URL environment variable is correct
3. Cookies are enabled in your browser

### Issue: Can't connect to database
**Solution:** Verify your DATABASE_URL format:
```
postgresql://username:password@host:port/database
```

---

## 📝 Quick Reference SQL Queries

### View all users (without passwords)
```sql
SELECT id, username, email, department, leetcode_username, role, joined_at 
FROM users 
ORDER BY joined_at DESC;
```

### Count users by role
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### View user stats
```sql
SELECT u.username, u.email, s.total_solved, s.easy_solved, s.medium_solved, s.hard_solved
FROM users u
LEFT JOIN stats s ON u.id = s.user_id
ORDER BY s.total_solved DESC;
```

### Delete all sessions (force logout all users)
```sql
DELETE FROM session;
```

### Update user password (use bcrypt hash!)
```sql
UPDATE users 
SET password = '$2b$10$...' 
WHERE email = 'user@example.com';
```

---

## 🚀 Next Steps

1. ✅ Database set up
2. ✅ Admin account created
3. 🎯 Log in and change default password
4. 🎯 Start adding students
5. 🎯 Configure batches
6. 🎯 Track LeetCode progress!

---

## 📞 Need Help?

If you encounter any issues:

1. Check the logs in the terminal
2. Verify DATABASE_URL is correct
3. Ensure PostgreSQL is running
4. Try restarting the application

Happy coding! 🎉
