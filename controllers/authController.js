const User = require("../models/User");

const createUser = async (req, res) => {
    console.log("Route Hit");
    console.log(req.body);

    try {
        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password
        });

        console.log("User Created");

        res.send(user);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = createUser;