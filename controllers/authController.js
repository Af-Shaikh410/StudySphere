const User = require('../models/User');

// ══════════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════════
const registerUser = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.redirect('/loginpage');
        }

        const user = await User.create({ name, email, password });
        // password is auto-hashed by the pre-save hook in User model

        const token = user.generateToken();
        res.cookie('token', token, { httpOnly: true }); // httpOnly = JS can't read cookie (safer)

        return res.redirect('/loginpage');

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
};

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.redirect('/');
        }

        // ── NEW: block banned users from logging in ──
        if (existingUser.isBanned) {
            // You can make a separate /banned page or just redirect to home
            return res.redirect('/');
        }

        const result = await existingUser.comparePassword(password);

        if (!result) {
            return res.redirect('/loginpage');
        }

        const token = existingUser.generateToken();
        res.cookie('token', token, { httpOnly: true });

        return res.redirect('/profilepage');

    } catch (error) {
        console.log(error);
        return res.redirect('/loginpage');
    }
};

// ══════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════
const profile = async (req, res) => {
    try {
        // req.user is set by authMiddleware after verifying token
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.redirect('/loginpage');
        }

        return res.render('Profile', { user });

    } catch (error) {
        console.log(error);
        return res.redirect('/loginpage');
    }
};

// ══════════════════════════════════════════════
//  ADMIN PAGE (basic — full admin is in adminController)
// ══════════════════════════════════════════════
const admin = (req, res) => {
    res.send("Welcome to Admin Page");
};

module.exports = { registerUser, login, profile, admin };