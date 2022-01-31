// Import the package
const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");

// Execute the package
const app = express();

app.get("/", (req, res) => {
  res.send("REST API is running.");
});

const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Connect to DB, see .env file;
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {}
);

// DB Connection status - 0: disconnected; 1: connected; 2: connecting; 3: disconnecting;
console.log("DB connection status: " + mongoose.connection.readyState);

// Import routes;
const itemRoute = require("./routes/itemRoutes");

// Every time you go to /item the itemRoute will be used;
app.use("/item", itemRoute);

app.listen(3001);
