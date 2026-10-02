const { body, validationResult } = require('express-validator');

const name = body('name').trim().isLength({ min: 20, max: 60 })
  .withMessage('Name must be 20-60 characters');
const email = body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail();
const address = body('address').trim().notEmpty().isLength({ max: 400 })
  .withMessage('Address is required, max 400 characters');
const password = (field = 'password') => body(field)
  .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
  .matches(/[^A-Za-z0-9]/).withMessage('Password needs a special character');

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};

module.exports = { name, email, address, password, handle };