const crypto = require('crypto');

// Generate a random session secret
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log(`SESSION_SECRET=${sessionSecret}`);

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(`JWT_SECRET=${jwtSecret}`);
