const User = require('../models/User');
const File = require('../models/File');
const fs   = require('fs');
const path = require('path');

// ══════════════════════════════════════════════
//  GET /admin
//  Show all users with warning/strike counts
// ══════════════════════════════════════════════
const adminDashboard = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .sort({ strikes: -1, warnings: -1 }) // worst offenders first
            .lean();

        // Count files per user in parallel
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const totalFiles   = await File.countDocuments({ uploadedBy: user._id });
                const flaggedFiles = await File.countDocuments({ uploadedBy: user._id, isFlagged: true });
                return { ...user, totalFiles, flaggedFiles };
            })
        );

        return res.render('admin/dashboard', {
            users: usersWithStats
        });

    } catch (error) {
        console.log(error);
        return res.redirect('/profilepage');
    }
};

// ══════════════════════════════════════════════
//  GET /admin/user/:userId
//  View one user's details + all their files
// ══════════════════════════════════════════════
const viewUser = async (req, res) => {
    try {
        const user  = await User.findById(req.params.userId);
        if (!user) return res.redirect('/admin');

        const files = await File.find({ uploadedBy: user._id })
            .sort({ createdAt: -1 });

        return res.render('admin/userDetail', {
            targetUser: user,
            files
        });

    } catch (error) {
        console.log(error);
        return res.redirect('/admin');
    }
};

// ══════════════════════════════════════════════
//  POST /admin/user/:userId/warn
//  1st offence — delete one file + warn user
//  Auto-escalates to strike after 3 warnings
// ══════════════════════════════════════════════
const warnUser = async (req, res) => {
    try {
        const { userId }        = req.params;
        const { fileId, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.redirect('/admin');

        // Delete the specific file that triggered the warning
        if (fileId) {
            const file = await File.findById(fileId);
            if (file) {
                deleteFileFromDisk(file.filePath);
                await File.findByIdAndDelete(fileId);
            }
        }

        user.warnings += 1;

        // 3 warnings → auto-escalate to a strike
        if (user.warnings >= 3) {
            user.strikes  += 1;
            user.warnings  = 0; // reset warning counter
            console.log(`⚠️  ${user.name} hit 3 warnings → auto-strike. Strikes: ${user.strikes}`);
        }

        await user.save();
        return res.redirect(`/admin/user/${userId}`);

    } catch (error) {
        console.log(error);
        return res.redirect('/admin');
    }
};

// ══════════════════════════════════════════════
//  POST /admin/user/:userId/strike
//  Repeated offences — delete ALL files + strike
//  Auto-bans after 3 strikes
// ══════════════════════════════════════════════
const strikeUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.redirect('/admin');

        // Delete every file this user uploaded
        const allFiles = await File.find({ uploadedBy: userId });
        for (const file of allFiles) {
            deleteFileFromDisk(file.filePath);
        }
        await File.deleteMany({ uploadedBy: userId });

        user.strikes  += 1;
        user.warnings  = 0; // strike resets warning counter too

        // 3 strikes → auto-ban
        if (user.strikes >= 3) {
            user.isBanned = true;
            console.log(`🚫 ${user.name} banned after 3 strikes`);
        }

        await user.save();
        return res.redirect(`/admin/user/${userId}`);

    } catch (error) {
        console.log(error);
        return res.redirect('/admin');
    }
};

// ══════════════════════════════════════════════
//  DELETE /admin/user/:userId
//  Permanently delete user + all their files
//  Use for severe cases / manual ban override
// ══════════════════════════════════════════════
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.redirect('/admin');

        // Safety: never delete another admin
        if (user.role === 'admin') {
            return res.redirect('/admin');
        }

        // Delete all files from disk + DB
        const allFiles = await File.find({ uploadedBy: userId });
        for (const file of allFiles) {
            deleteFileFromDisk(file.filePath);
        }
        await File.deleteMany({ uploadedBy: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        return res.redirect('/admin');

    } catch (error) {
        console.log(error);
        return res.redirect('/admin');
    }
};

// ══════════════════════════════════════════════
//  POST /admin/file/:fileId/flag
//  Mark a file as inappropriate for review
//  without deleting it yet
// ══════════════════════════════════════════════
const flagFile = async (req, res) => {
    try {
        const { fileId }  = req.params;
        const { reason }  = req.body;

        const file = await File.findById(fileId);
        if (!file) return res.redirect('/admin');

        file.isFlagged  = true;
        file.flagReason = reason || 'Flagged by admin';
        await file.save();

        return res.redirect(`/admin/user/${file.uploadedBy}`);

    } catch (error) {
        console.log(error);
        return res.redirect('/admin');
    }
};

// ──────────────────────────────────────────────
//  HELPER: safely delete a file from disk
//  filePath = value stored in DB, e.g. "uploads/abc.pdf"
// ──────────────────────────────────────────────
const deleteFileFromDisk = (filePath) => {
    try {
        const absolutePath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`🗑️  Deleted: ${absolutePath}`);
        }
    } catch (err) {
        // Log but don't crash — DB cleanup still continues
        console.error(`⚠️  Disk delete failed for ${filePath}:`, err.message);
    }
};

module.exports = { adminDashboard, viewUser, warnUser, strikeUser, deleteUser, flagFile };