const express = require("express");
const router = express.Router();
const User = require("../models/User");
const winston = require("winston");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../security/securityUtils.js");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/", async (req, res) => {
  // Creating new user (reading the details from the body)
  // to push to DB.
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  try {
    user.password = await bcrypt.hash(user.password, 4);
    const created = await user.save();
    res.json(created);
    logger.info("Created: " + created);
  } catch (err) {
    res.json({ errorMessage: err.message });
  }
});

router.get("/:userID", async (req, res) => {
  try {
    const itemfromDB = await User.findById(req.params.userID);
    res.json(itemfromDB);
  } catch (error) {
    res.json({ message: error });
  }
});

router.patch("/:userID", async (req, res) => {
  try {
    const updated = await User.updateOne(
      { _id: req.params.userID }, // _id - this is how ID looks in DB;
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, 4),
          role: req.body.role,
        },
      },
      { runValidators: true }
    );
    logger.info("Udpated: " + req.body.name);
    res.json(updated);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/:userID", async (req, res) => {
  try {
    const deleted = await User.deleteOne({ _id: req.params.userID });
    res.json(deleted);
    logger.info("Deleted item with ID: " + req.params.userID);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/login", async (req, res) => {
  // Destructuring
  const { email, password } = req.body;

  // Using email to find the user in DB, email is unique.
  try {
    const user = await User.findOne({ email });

    // Matching the password from request with the one of the user from DB.
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token:  generateJWT(user.id)
      });
    } else {
      res.status(400);
      throw new Error("Invalid credentials.");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
