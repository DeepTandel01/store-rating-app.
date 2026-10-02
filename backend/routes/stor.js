const router = require('express').Router();
const db = require('../config/db');
const sortClause = require('../utils/sort');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('user'));

router.get('/', async (req, res, next) => {
  try {
    const { search = '', sortBy, order } = req.query;
    const orderBy = sortClause(
      { name: 's.name', address: 's.address', rating: 'overall_rating' }, sortBy, order, 'name');
    const { rows } = await db.query(
      `SELECT s.id, s.name, s.address,
              COALESCE(ROUND(AVG(r.rating),1),0) AS overall_rating,
              MAX(CASE WHEN r.user_id=$1 THEN r.rating END) AS my_rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.name ILIKE $2 OR s.address ILIKE $2
       GROUP BY s.id ${orderBy}`,
      [req.user.id, `%${search}%`]);
    res.json(rows);
  } catch (e) { next(e); }
});

// submit OR modify (upsert)
router.put('/:id/rating', async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be an integer 1-5' });
    await db.query(
      `INSERT INTO ratings (user_id,store_id,rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id,store_id)
       DO UPDATE SET rating=EXCLUDED.rating, updated_at=NOW()`,
      [req.user.id, req.params.id, rating]);
    res.json({ message: 'Rating saved' });
  } catch (e) {
    if (e.code === '23503') return res.status(404).json({ message: 'Store not found' });
    next(e);
  }
});

module.exports = router;