require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

(async () => {
  await db.query(
    `INSERT INTO users (name,email,password_hash,address,role)
     VALUES ($1,$2,$3,$4,'admin') ON CONFLICT (email) DO NOTHING`,
    ['System Administrator Account', 'admin@example.com',
     await bcrypt.hash('Admin@1234', 10), 'Head Office, Surat']);
  console.log('Admin seeded: admin@example.com / Admin@1234');
  process.exit(0);
})();
