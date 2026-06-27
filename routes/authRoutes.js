const express = require('express');
router = express.Router();
const { createUser, loginUser } = require("../controllers/authController");

const { registerUser, login, profile, admin } = require('../controllers/authController');
const { adminDashboard, viewUser, warnUser, strikeUser, deleteUser, flagFile } = require('../controllers/adminController');

const { isLoggedIn, isGuest } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

// ── Auth routes ────────────────────────────────
router.get('/', isGuest, (req, res) => res.render('Register'));
router.post('/register', isGuest, registerUser);
router.get('/loginpage', isGuest, (req, res) => res.render('Login'));
router.post('/login', isGuest, login);
router.get('/profilepage', isLoggedIn, profile);

// ── Admin routes ───────────────────────────────
router.get('/admin', isAdmin, adminDashboard);
router.get('/admin/user/:userId', isAdmin, viewUser);
router.post('/admin/user/:userId/warn', isAdmin, warnUser);
router.post('/admin/user/:userId/strike', isAdmin, strikeUser);
router.delete('/admin/user/:userId', isAdmin, deleteUser);
router.post('/admin/file/:fileId/flag', isAdmin, flagFile);

module.exports = router;

router.post("/login", login);

module.exports = router;