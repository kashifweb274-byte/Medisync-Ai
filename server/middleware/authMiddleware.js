const jwt = require('jsonwebtoken');

// Verify JWT Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
      }
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Check if user is a Doctor
const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Doctor authorization required.' });
};

// Check if user is a Patient / User
const isPatient = (req, res, next) => {
  if (req.user && (req.user.role === 'patient' || req.user.role === 'user')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Patient authorization required.' });
};

module.exports = { protect, isDoctor, isPatient };