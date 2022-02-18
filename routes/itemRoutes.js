const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const winston = require("winston");
const { protect } = require("../security/securityUtils.js");
const swaggerJSDoc = require("swagger-jsdoc");

// Swagger guide: https://javascript.plainenglish.io/how-to-implement-and-use-swagger-in-nodejs-d0b95e765245

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
 *     Item:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - quantity
 *       properties:
 *         title:
 *           type: string
 *           description: title/name of the item
 *         description:
 *           type: string
 *           description: description of the item
 *         price:
 *           type: integer
 *           description: price of the item
 *         quantity:
 *           type: integer
 *           description: quantity of the item
 *       example:
 *         title: Telephone
 *         description: Old but gold
 *         price: 900
 *         quantity: 1
 */

/**
 * @swagger
 * /item/all:
 *  get:
 *    description: use to request all items
 *    tags: [Items]
 *    responses:
 *      '200':
 *        description: successful response
 */
router.get("/all", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/admin/all", protect, async (req, res) => {
  // The authenticated user will be present in req (see securityUtils.protect).
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

/**
 * @swagger
 * /item/{itemID}:
 *  get:
 *    description: get Item by its ID
 *    tags: [Items]
 *    parameters:
 *       - in : path
 *         name: itemID
 *         description: id of an item
 *         schema:
 *           type: string
 *           required: true
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.get("/:itemID", async (req, res) => {
  try {
    const itemfromDB = await Item.findById(req.params.itemID);
    res.json(itemfromDB);
  } catch (error) {
    res.status(400);
    res.json({ message: error });
  }
});

/**
 * @swagger
 * /item:
 *  post:
 *    description: create new Item
 *    tags: [Items]
 *    requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *    responses:
 *      '201':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.post("/", async (req, res) => {
  // Creating the item (reading the details from the body)
  // to push to DB.
  const item = new Item({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
  });
  
  try {
    const created = await item.save();
      res.json(created);
      logger.info("Created: " + created);
  } catch (err) {
    res.json({ errorMessage: err });
  }
});

/**
 * @swagger
 * /item/{itemID}:
 *  patch:
 *    description: update item info
 *    tags: [Items]
 *    parameters:
 *       - in : path
 *         name: itemID
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
 *              title:
 *                type: string
 *              description: 
 *                type: string
 *              price: 
 *                type: integer
 *              quantity: 
 *                type: integer
 *             example:
 *                title: Telephone_updated
 *                description: updated_descr
 *                price: 599
 *                quantity: 7
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.patch("/:itemID", async (req, res) => {
  try {
    // If the quantity is zero, then it makes no sense to update the item
    // We can delete the item.
    if (req.body.quantity <= 0) {
      const deleted = await Item.deleteOne({ _id: req.params.itemID });
      logger.info("Deleted item " + req.body.title + " because quantity = " + req.body.quantity);
      res.json(deleted);
    } else {
      const updatedItem = await Item.updateOne(
        { _id: req.params.itemID },  // _id - this is how ID looks in DB;
        {
            $set:
            {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity
            }
        }, { runValidators: true }
    );
    logger.info("Udpated: " + req.body.title)
    res.json(updatedItem);
    }
  } catch (err) {
    res.status(400);
      res.json({ message: err });
  }
});

/**
 * @swagger
 * /item/{itemID}:
 *  delete:
 *    description: delete item by its ID
 *    tags: [Items]
 *    parameters:
 *       - in : path
 *         name: itemID
 *         description: id of an item
 *         schema:
 *           type: string
 *           required: true
 *    responses:
 *      '200':
 *        description: successful response
 *      '400':
 *        description: bad request
 */
router.delete("/:itemID", async (req, res) => {
  try {
    const deleted = await Item.deleteOne({ _id: req.params.itemID });
    res.json(deleted);
    logger.info("Deleted item with ID: " + req.params.itemID);
  } catch (err) {
    res.status(400);
    res.json({ message: err });
  }
});

router.post("/updateQuantity", async (req, res) => {
  try {
    let updatedItems = [];
    for (let i = 0; i < req.body.length; i++) {
      await Item.updateOne(
        { _id: req.body[i]._id },  // _id - this is how ID looks in DB;
        {
            $set:
            {
                title: req.body[i].title,
                description: req.body[i].description,
                price: req.body[i].price,
                quantity: req.body[i].quantity
            }
        }, { runValidators: true }
    );
    updatedItems.push(req.body[i].title);
  }
    
    logger.info("Updated quantity of " + updatedItems.map(title => title));
    res.json(updatedItems);

  } catch (err) {
    res.json({ message: err });
  }
});



module.exports = router;
