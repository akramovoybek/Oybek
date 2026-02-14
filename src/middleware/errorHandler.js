const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => e.message),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.errors.map((e) => e.message),
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
