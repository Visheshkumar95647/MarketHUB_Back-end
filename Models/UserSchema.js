const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    image: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    pin: {
        type: Number,
        required: true
    }
});

const User = mongoose.model("userData", UserSchema);
module.exports = User;
