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
        required: true,
        min: [0, 'Price cannot be less than zero.']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be zero or less.']
    }
});

// Making the items available outside of this file.
module.exports = mongoose.model("Items", ItemSchema);