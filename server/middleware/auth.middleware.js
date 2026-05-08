const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId, role: decodedToken.role };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};
