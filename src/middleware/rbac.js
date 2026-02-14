const { ROLES } = require('../config/constants');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const isAdmin = requireRole(ROLES.ADMIN);
const isUser = requireRole(ROLES.USER, ROLES.ADMIN);

module.exports = { requireRole, isAdmin, isUser };
