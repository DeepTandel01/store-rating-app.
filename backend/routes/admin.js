const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const v = require('../middleware/validate');
const sortClause = require('../utils/sort');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const q = async (t) => +(await db.query(`SELECT COUNT(*) FROM ${t}`)).rows[0].count;
    res.json({ users: await q('users'), stores: await q('stores'), ratings: await q('ratings') });
  } catch (e) { next(e); }
});

router.post('/users',
  [v.name, v.email, v.address, v.password(),
   body('role').isIn(['admin', 'user', 'owner']).withMessage('Invalid role'), v.handle],
  async (req, res, next) => {
    try {
      const { name, email, address, password, role } = req.body;
      const { rows } = await db.query(
        `INSERT INTO users (name,email,password_hash,address,role)
         VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,address,role`,
        [name, email, await bcrypt.hash(password, 10), address, role]);
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ message: 'Email already exists' });
      next(e);
    }
  });

router.get('/users', async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', role = '', sortBy, order } = req.query;
    const orderBy = sortClause({ name: 'name', email: 'email', address: 'address', role: 'role' },
      sortBy, order, 'name');
    const { rows } = await db.query(
      `SELECT id,name,email,address,role FROM users
       WHERE name ILIKE $1 AND email ILIKE $2 AND address ILIKE $3
         AND ($4 = '' OR role = $4) ${orderBy}`,
      [`%${name}%`, `%${email}%`, `%${address}%`, role]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id,name,email,address,role FROM users WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    if (user.role === 'owner') {
      const r = await db.query(
        `SELECT COALESCE(ROUND(AVG(r.rating),1),0) AS rating
         FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1`, [user.id]);
      user.rating = r.rows[0].rating;
    }
    res.json(user);
  } catch (e) { next(e); }
});

router.post('/stores',
  [v.name, v.email, v.address, body('ownerId').optional({ nullable: true, checkFalsy: true }).isInt(), v.handle],
  async (req, res, next) => {
    try {
      const { name, email, address, ownerId } = req.body;
      if (ownerId) {
        const o = await db.query("SELECT 1 FROM users WHERE id=$1 AND role='owner'", [ownerId]);
        if (!o.rowCount) return res.status(400).json({ message: 'ownerId must be a Store Owner user' });
      }
      const { rows } = await db.query(
        `INSERT INTO stores (name,email,address,owner_id) VALUES ($1,$2,$3,$4) RETURNING *`,
        [name, email, address, ownerId || null]);
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ message: 'Store email or owner already used' });
      next(e);
    }
  });

router.get('/stores', async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', sortBy, order } = req.query;
    const orderBy = sortClause(
      { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' }, sortBy, order, 'name');
    const { rows } = await db.query(
      `SELECT s.id,s.name,s.email,s.address, COALESCE(ROUND(AVG(r.rating),1),0) AS rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3
       GROUP BY s.id ${orderBy}`,
      [`%${name}%`, `%${email}%`, `%${address}%`]);
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
