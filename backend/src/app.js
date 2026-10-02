const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('../routes/auth'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/stores', require('../routes/stor'));
app.use('/api/owner', require('../routes/owner'));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
