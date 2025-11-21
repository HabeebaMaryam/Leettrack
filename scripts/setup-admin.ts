import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function setupAdmin() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL is not set');
      process.exit(1);
    }

    const pool = new Pool({ connectionString: databaseUrl });

    console.log('🔧 Creating default admin user...\n');
    
    const username = 'admin';
    const email = 'admin@leettrack.com';
    const password = 'admin123';
    const department = 'IT Department';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists! Updating password...');
      await pool.query(
        `UPDATE users 
         SET password = $1, role = 'admin', department = $2 
         WHERE email = $3 OR username = $4`,
        [hashedPassword, department, email, username]
      );
      console.log('✅ Admin user password updated!');
    } else {
      // Create new admin user
      await pool.query(
        `INSERT INTO users (username, email, password, department, role) 
         VALUES ($1, $2, $3, $4, 'admin')`,
        [username, email, hashedPassword, department]
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

setupAdmin();
