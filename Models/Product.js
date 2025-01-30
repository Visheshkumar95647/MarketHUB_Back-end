const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    Productimages: {
        type: [String], 
        required: true,
    },
    
})

const ProductUser = mongoose.model("ProductData", ProductSchema);
module.exports = ProductUser;