const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

// Making the items available outside of this file.
module.exports = mongoose.model("Items", ItemSchema);