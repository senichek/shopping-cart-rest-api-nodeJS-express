const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const winston = require("winston");
const { Schema } = require("mongoose");

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
    logger.info("getAll was called");
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
  
  try {
    const created = await item.save();
      res.json(created);
      logger.info("Created: " + created);
  } catch (err) {
    res.json({ errorMessage: err });
  }
});

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
      res.json({ message: err });
  }
});

router.delete("/:itemID", async (req, res) => {
  try {
    const deleted = await Item.deleteOne({ _id: req.params.itemID });
    res.json(deleted);
    logger.info("Deleted item with ID: " + req.params.itemID);
  } catch (err) {
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
