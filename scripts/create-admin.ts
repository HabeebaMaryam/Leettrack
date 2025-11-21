import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL is not set in your environment variables');
      process.exit(1);
    }

    const pool = new Pool({ connectionString: databaseUrl });

    console.log('\n🔧 Admin User Creation Tool\n');
    
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const department = await question('Enter department (optional, press Enter to skip): ');

    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('\n⚠️  A user with this email or username already exists!');
      const update = await question('Do you want to update the existing user? (yes/no): ');
      
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        await pool.query(
          `UPDATE users 
           SET password = $1, role = 'admin', department = $2 
           WHERE email = $3 OR username = $4`,
          [hashedPassword, department || null, email, username]
        );
        console.log('\n✅ Admin user updated successfully!');
      } else {
        console.log('\n❌ Operation cancelled');
      }
    } else {
      // Create new admin user
      await pool.query(
        `INSERT INTO users (username, email, password, department, role) 
         VALUES ($1, $2, $3, $4, 'admin')`,
        [username, email, hashedPassword, department || null]
      );
      console.log('\n✅ Admin user created successfully!');
    }

    console.log('\nYou can now login with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

    await pool.end();
    rl.close();
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
