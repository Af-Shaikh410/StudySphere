const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ══════════════════════════════════════════════
//  isAdmin
//  Checks JWT token AND confirms role === 'admin'
//  in the database (not just in the token).
//
//  Why check DB? So if you change a user's role
//  from admin → user, they lose access immediately
//  even if their token hasn't expired yet.
// ══════════════════════════════════════════════
const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/loginpage');
        }

        // Step 1: Verify token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 2: Fetch fresh user from DB (don't trust token role alone)
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.redirect('/loginpage');
        }

        // Step 3: Confirm they are actually an admin
        if (user.role !== 'admin') {
            return res.redirect('/profilepage'); // logged in but not admin
        }

        // Attach full user to req for use in admin controllers
        req.user = decoded;
        req.adminUser = user;

        next();

    } catch (error) {
        console.log("Admin middleware error:", error.message);
        res.clearCookie('token');
        return res.redirect('/loginpage');
    }
};

module.exports = { isAdmin };