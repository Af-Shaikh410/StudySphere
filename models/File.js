const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({

    // Name shown to users — e.g. "Chapter5_Notes.pdf"
    originalName: {
        type: String,
        required: true,
        trim: true
    },

    // Where multer saved it — e.g. "uploads/abc123.pdf"
    // Used to delete from disk when admin removes it
    filePath: {
        type: String,
        required: true
    },

    // MIME type — e.g. "application/pdf", "image/jpeg"
    fileType: {
        type: String,
        required: true
    },

    // File size in bytes
    fileSize: {
        type: Number
    },

    // Admin can mark a file for review before acting
    isFlagged: {
        type: Boolean,
        default: false
    },

    // Admin's note when flagging — e.g. "spam", "explicit image"
    flagReason: {
        type: String,
        default: ''
    },

    // Which user uploaded this file
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

const File = mongoose.model("File", fileSchema);
module.exports = File;