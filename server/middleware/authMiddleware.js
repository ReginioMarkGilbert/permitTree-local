const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // console.log('Auth Header:', authHeader); // Log the full auth header
    const token = authHeader && authHeader.split(' ')[1];
    // console.log('Extracted Token:', token); // Log the extracted token

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

module.exports = { authenticateToken };