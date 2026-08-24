import rateLimit from 'express-rate-limit';

/**
 * Global API rate limiter
 * Allows up to 300 requests per 15-minute window per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again later.',
  },
});

/**
 * Strict rate limiter for Authentication routes (login, register)
 * Protects against brute-force and dictionary credential attacks.
 * Max 10 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * Sensitive mutation rate limiter (e.g. email invitations)
 * Prevents spamming users with email invitations.
 * Max 20 invitations per 15-minute window per IP.
 */
export const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many invitations sent from this IP. Please try again in 15 minutes.',
  },
});
