const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    // Read JWT from the 'token' cookie
    token = req.cookies.token;

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (payload)
            req.user = await User.findById(decoded.userId).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).render('login', { error: 'Not authorized, token failed. Please log in.' });
        }
    } else {
        res.status(401).render('login', { error: 'Not authorized, no token. Please log in.' });
    }
};

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Not authorized as an admin');
    }
};

module.exports = { protect, isAdmin };