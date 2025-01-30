const express = require('express');
const VerifyToken = require('../middleware');
const MessageSchema = require('../Models/message');
const User = require('../Models/UserSchema');
const router = express.Router();
const ChatModel = require('../Models/ChatModel');

// Create a message
router.post("/createmessage", VerifyToken, async (req, res) => {
    console.log("Attempting to create message...");
    const { content, chatId } = req.body;

    // Validate input
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.status(400).json({ error: "Invalid Passed Data" });
    }

    console.log(req.user)
    const newMessage = {
        content: content,
        sender: req.user.id,
        chatId: chatId
    };

    try {
        console.log("Creating new message...");
        // Create a new message document
        let message = await MessageSchema.create(newMessage);
        
        // Populate the sender field with name and image
        message = await message.populate("sender", "name image");

        // Populate the chatId field
        message = await message.populate("chatId");

        // Populate the users in the chatId with name, image, and email
        message = await User.populate(message, {
            path: "chatId.users",
            select: "name image email"
        });

        // Update the latestMessage in the Chat model
        await ChatModel.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        // Respond with the created message
        res.status(200).json(message);
    } catch (error) {
        console.error("Error during message creation:", error);
        // Send the actual error message to make debugging easier
        res.status(400).json({ error: error.message });
    }
});

// Get all messages for a chat
router.get("/allMessage/:chatId", VerifyToken, async (req, res) => {
    const chatId = req.params.chatId;

    try {
        console.log("Fetching all messages for chat:", chatId);
        // Find all messages for the given chatId and populate relevant fields
        const messages = await MessageSchema.find({ chatId })
            .populate("sender", "name image email")  // Populate sender info
            .populate("chatId");  // Populate chatId info

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        // Send the actual error message to make debugging easier
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
