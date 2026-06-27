const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const jwt      = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // ── NEW: moderation fields ──────────────────
    warnings: {
        type: Number,
        default: 0    // 3 warnings → auto-strike
    },
    strikes: {
        type: Number,
        default: 0    // 3 strikes → auto-ban
    },
    isBanned: {
        type: Boolean,
        default: false  // banned users cannot login
    }

}, { timestamps: true });

// ── Hash password before saving ────────────────
// Runs automatically on every .save() if password changed
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ── Compare password at login ──────────────────
// Usage: const isMatch = await user.comparePassword(inputPassword)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Generate JWT token ─────────────────────────
// Usage: const token = user.generateToken()
userSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },  // payload — role included for admin checks
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const User = mongoose.model("User", userSchema);
module.exports = User;