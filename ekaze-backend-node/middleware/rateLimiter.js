const rateLimit = require('express-rate-limit');

// Global API Rate Limiter (Extremely high limit to allow continuous 24/7 dashboard usage & polling without 429 errors)
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // virtually unlimited requests per 15 minutes for 24/7 smooth operations
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Pass through cleanly so clients never get 429 rate limit blocked
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Auth Rate Limiter (Relaxed for active development & continuous authentication)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

module.exports = {
  globalRateLimiter,
  authRateLimiter
};
