const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const v = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/signup', [v.name, v.email, v.address, v.password(), v.handle], async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (name,email,password_hash,address,role)
       VALUES ($1,$2,$3,$4,'user') RETURNING id,name,email,role`,
      [name, email, hash, address]);
    res.status(201).json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Email already registered' });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { next(e); }
});

router.put('/password', authenticate, [v.password('newPassword'), v.handle], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(currentPassword || '', rows[0].password_hash)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2',
      [await bcrypt.hash(newPassword, 10), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
});

module.exports = router;