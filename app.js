require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("StudySphere Running 🚀");
});

const PORT = process.env.PORT || 3000;

connectDB();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});