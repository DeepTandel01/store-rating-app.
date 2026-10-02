module.exports = (allowed, sortBy, order, fallback) => {
  const col = allowed[sortBy] || allowed[fallback];
  return `ORDER BY ${col} ${String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
};