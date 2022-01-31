const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const winston = require("winston");

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
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/:itemID", async (req, res) => {
  try {
    const itemfromDB = await Item.findById(req.params.itemID);
    res.json(itemfromDB);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  // Creating the item (reading the details from the body)
  // to push to DB.
  const item = new Item({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
  });

  // Checking if the item with the same name is present in DB.
  let presentInDB = await Item.findOne({ title: item.title });

  // If the item with the same name is present in DB
  // then increase the item quantity instead of creating
  // another copy in DB.
  try {
    if (presentInDB) {
      const updatedItem = await Item.updateOne(
        { _id: presentInDB._id }, // _id - this is how ID looks in DB;
        { $set: { 
          quantity: req.body.quantity + presentInDB.quantity,
          description: req.body.description,
          price: req.body.price,
        } },
        { runValidators: true } // runValidators activates the validation of constraints from models.Item.js (Mongoose schema).
      );
      logger.info("Updated quantity of " + presentInDB.title);
      res.json(updatedItem);
    } else {
      const created = await item.save();
      res.json(created);
      logger.info("Created: " + created);
    }
  } catch (err) {
    res.json({ errorMessage: err });
  }
});

router.delete("/:itemID", async (req, res) => {
  try {
    const deleted = await Item.deleteOne({ _id: req.params.itemID });
    res.json(deleted);
    logger.info("Deleted: " + deleted);
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/:itemID", async (req, res) => {
  try {
    const updatedItem = await Item.updateOne(
      { _id: req.params.userID }, // _id - this is how ID looks in DB;
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          quantity: req.body.quantity,
        },
      },
      { runValidators: true } // runValidators activates the validation of constraints from models.Item.js (Mongoose schema).
    );
    logger.info("Updated: " + updatedItem);
    res.json(updatedItem);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
