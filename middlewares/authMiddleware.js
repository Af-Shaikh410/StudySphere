const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ══════════════════════════════════════════════
//  isLoggedIn
//  Verifies the JWT token from cookie.
//  Attaches decoded user to req.user
//  Used on: /profilepage and any protected route
// ══════════════════════════════════════════════
const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // No token → not logged in
        if (!token) {
            return res.redirect('/loginpage');
        }

        // Verify and decode the token
        // jwt.verify throws if token is expired or tampered
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded info to req so controllers can use it
        // decoded = { id: '...', role: 'user'/'admin', iat, exp }
        req.user = decoded;

        next();

    } catch (error) {
        // Token invalid or expired → force re-login
        console.log("Auth error:", error.message);
        res.clearCookie('token');
        return res.redirect('/loginpage');
    }
};

// ══════════════════════════════════════════════
//  isGuest
//  Blocks already-logged-in users from seeing
//  /login and /register pages
// ══════════════════════════════════════════════
const isGuest = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) return next(); // no token = guest, let them through

        // If token is valid, user is already logged in
        jwt.verify(token, process.env.JWT_SECRET);
        return res.redirect('/profilepage'); // send them to profile instead

    } catch (error) {
        // Invalid token = treat as guest
        return next();
    }
};

module.exports = { isLoggedIn, isGuest };