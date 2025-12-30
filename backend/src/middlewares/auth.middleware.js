const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authuser(req, res, next) {
    try {
        const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: User not found'
            });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
}

module.exports = {
    authuser
};