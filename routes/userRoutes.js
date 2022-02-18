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

// Schemas and docs must be in the same file.
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: user name
 *         email:
 *           type: string
 *           description: user email
 *         password:
 *           type: string
 *           description: user password
 *         role:
 *           type: string
 *           descripton: user role
 *       example:
 *         name: Jane
 *         email: jane@gmail.com
 *         password: rootroot
 *         role: Admin
 */

/**
 * @swagger
 * /user/all:
 *  get:
 *    description: use to request all users from db
 *    tags: [Users]
 *    responses:
 *      '200':
 *        description: successful response
 */
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json({ message: err });
  }
});

/**
 * @swagger
 * /user:
 *  post:
 *    description: create new User
 *    tags: [Users]
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *    responses:
 *      '201':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
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
    res.status(201);
    res.json(created);
    logger.info("Created: " + created);
  } catch (err) {
    res.json({ errorMessage: err.message });
  }
});

/**
 * @swagger
 * /user/{userID}:
 *  get:
 *    description: get User by its ID
 *    tags: [Users]
 *    parameters:
 *       - in : path
 *         name: userID
 *         description: id of user
 *         schema:
 *           type: string
 *           required: true
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.get("/:userID", async (req, res) => {
  try {
    const itemfromDB = await User.findById(req.params.userID);
    res.json(itemfromDB);
  } catch (error) {
    res.status(400);
    res.json({ message: error });
  }
});

/**
 * @swagger
 * /user/{userID}:
 *  patch:
 *    description: update user info
 *    tags: [Users]
 *    parameters:
 *       - in : path
 *         name: userID
 *         description: id of user
 *         schema:
 *           type: string
 *           required: true
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              name:
 *                type: string
 *              email: 
 *                type: string
 *             example:
 *                name: updatedName
 *                email: updated@gmail.com
 *                password: pass111
 *                role: User
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
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

/**
 * @swagger
 * /user/{userID}:
 *  delete:
 *    description: delete user by its ID
 *    tags: [Users]
 *    parameters:
 *       - in : path
 *         name: userID
 *         description: id of user
 *         schema:
 *           type: string
 *           required: true
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.delete("/:userID", async (req, res) => {
  try {
    const deleted = await User.deleteOne({ _id: req.params.userID });
    res.json(deleted);
    logger.info("Deleted item with ID: " + req.params.userID);
  } catch (err) {
    res.status(400);
    res.json({ message: err });
  }
});

/**
 * @swagger
 * /user/login:
 *  post:
 *    description: log in the registered user
 *    tags: [Users]
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              email:
 *                type: string
 *              password: 
 *                type: string
 *             example:
 *                email: john@gmail.com
 *                password: pass111
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.post("/login", async (req, res) => {
  // Destructuring
  const { email, password } = req.body;

  // Using email to find the user in DB, email is unique.
  try {
    const user = await User.findOne({ email });

    /* Matching the password from request with the one of the user from DB.
    If the user exists and the password is correct, we return the user with
    the JWT token that can be used for further authentification in 
    <securityUtils.protect> method.  */
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
