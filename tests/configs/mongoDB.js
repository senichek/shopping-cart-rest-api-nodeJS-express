// Mongo in-memory database for testing only.
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const connectDB = async () => {
    const mongo = await MongoMemoryServer.create();
    const mongoURI = mongo.getUri();
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

module.exports.connectDB = connectDB();