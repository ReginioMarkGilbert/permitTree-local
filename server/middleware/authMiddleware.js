const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

const authenticateSuperAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (req.user && req.user.role === 'superadmin') {
            console.log('SuperAdmin authenticated');
            next();
        } else {
            console.log('Access denied. SuperAdmin privileges required.');
            res.status(403).json({ message: "Access denied. SuperAdmin privileges required." });
        }
    });
};

module.exports = { authenticateToken, authenticateSuperAdmin };
