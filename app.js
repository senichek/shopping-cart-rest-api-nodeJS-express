// Import the package
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const Item = require("./models/Item"); // Mongoose Schema
const products = require('./productsCollection.json')
require("dotenv/config");

// Execute the package
const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(cors({
    origin: ['http://localhost:3000']
}));

// Connect to DB, see .env file;
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {}
);

// Remove all entries from DB on the application's start up.
Item.deleteMany({}, () => {})
// Populate DB on the application's start up.
Item.insertMany(products);

// DB Connection status - 0: disconnected; 1: connected; 2: connecting; 3: disconnecting;
console.log("DB connection status: " + mongoose.connection.readyState);

// Import routes;
const itemRoute = require("./routes/itemRoutes");

// Every time you go to /item the itemRoute will be used;
app.use("/item", itemRoute);

app.listen(3001);

module.exports.server = app;