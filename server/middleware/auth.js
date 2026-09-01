const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'promanager_secret');
    req.user = decoded;
    if (typeof next === 'function') {
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed. Please sign in again.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    if (typeof next === 'function') {
      return next();
    }
  } else {
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly };
