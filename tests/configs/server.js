// Import the package
const express = require("express");

// Execute the package
const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Import routes;
const itemRoute = require("../../routes/itemRoutes");
const userRoute = require("../../routes/userRoutes");

// Every time you go to /item the itemRoute will be used;
app.use("/item", itemRoute);
app.use("/user", userRoute);

const listener = app.listen();

module.exports.testServer = app;
module.exports.listener = listener;