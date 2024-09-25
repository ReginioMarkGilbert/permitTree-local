const roleMiddleware = (roles) => {
    return (req, res, next) => {
        console.log('User roles:', req.user.role); // Change this line
        if (!req.user || !roles.includes(req.user.role)) { // Change this line
            console.log('Access denied: User does not have required role');
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = roleMiddleware;
