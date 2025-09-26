const jwt = require('jsonwebtoken');

// Supabase JWT secret (기본값: supabase)
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';

// Service role payload
const payload = {
  iss: 'supabase',
  ref: 'fwbkesioorqklhlcgmio',
  role: 'service_role',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 60 * 60), // 100년
};

// JWT 생성
const serviceRoleKey = jwt.sign(payload, JWT_SECRET);

console.log('Generated Service Role Key:');
console.log(serviceRoleKey);