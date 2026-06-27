require("dotenv").config();

const express = require("express");
const path = require("path");
const router = require("./routes/authRoutes");
const session = require('express-session');
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  //cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 1 day
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("StudySphere Running 🚀");
});
app.use("/api/auth", router);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
};

startServer();