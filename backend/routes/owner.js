const router = require('express').Router();
const db = require('../config/db');
const sortClause = require('../utils/sort');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('owner'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const s = await db.query('SELECT id,name,address FROM stores WHERE owner_id=$1', [req.user.id]);
    if (!s.rows[0]) return res.json({ store: null, averageRating: 0, raters: [] });
    const store = s.rows[0];
    const orderBy = sortClause({ name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' },
      req.query.sortBy, req.query.order, 'name');
    const avg = await db.query(
      'SELECT COALESCE(ROUND(AVG(rating),1),0) AS avg FROM ratings WHERE store_id=$1', [store.id]);
    const raters = await db.query(
      `SELECT u.id,u.name,u.email,r.rating,r.updated_at AS date
       FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=$1 ${orderBy}`, [store.id]);
    res.json({ store, averageRating: avg.rows[0].avg, raters: raters.rows });
  } catch (e) { next(e); }
});

module.exports = router;