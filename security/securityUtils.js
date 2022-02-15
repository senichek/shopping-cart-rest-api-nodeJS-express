const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv/config");

const generateJWT = (userID) => {
    //process.env.JWT_SECRET - environment variable (.env)
  return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const protect = async (req, res, next) => {
    let token;

     /* Authorization info is sent in Headers. When the token 
     is sent in authorization header it's formated like this: Bearer ......... 
    So, we need to get the token out of that header string. */
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header.
            token = req.headers.authorization.split(' ')[1];

            // Verify the token.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // The decoded token has the user's ID (see generateJWT method). 
            // We use ID to get the user from DB.
            req.user = await User.findById(decoded.userID).select('-password'); // it will not inculde the password
            next();
        } catch (error) {
            res.status(401) // Not authorized
            throw new Error("Authentication error.")
        }
    }
    if (!token) {
        res.status(401);
        res.json({ message: "Authentication error. No token." });
    }
}

module.exports = {
    generateJWT,
    protect
}