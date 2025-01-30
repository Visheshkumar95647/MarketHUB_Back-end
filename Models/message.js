const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    sender: {
        // this means this contain _id of sender
        type: mongoose.Schema.Types.ObjectId,
        ref: "userData",
        required: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    content: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: true
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
    