const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI);

        console.log("MongoDB Connected Successfully");
        console.log("Database:", conn.connection.name);

    } catch (error) {
        console.log("Database Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;