import bcrypt from 'bcrypt';

async function generateHash() {
  const password = process.argv[2] || 'admin123';
  
  console.log(`\nGenerating bcrypt hash for password: "${password}"\n`);
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Hashed password:');
  console.log(hash);
  console.log('\nCopy this hash and use it in your SQL INSERT statement!\n');
  console.log('Example:');
  console.log(`INSERT INTO users (username, email, password, department, role)`);
  console.log(`VALUES ('admin', 'admin@example.com', '${hash}', 'IT', 'admin');\n`);
}

generateHash();
