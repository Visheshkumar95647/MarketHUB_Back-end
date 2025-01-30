const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true // Trims whitespace from the start and end
    },
    isGroup: { 
      type: Boolean, 
      default: false // Default value for group chats
    },
    users: [
      {
        //It tell users in the chat
        type: mongoose.Schema.Types.ObjectId, // Type of reference field
        ref: "userData" // Reference to the User model name (ensure it matches the model name)
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId, // Type of reference field
      ref: "Message" // Reference to the Message model name (ensure it matches the model name)
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId, // Type of reference field
      ref: "userData" // Reference to the User model name (ensure it matches the model name)
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields
  }
);

const Chat = mongoose.model("Chat", ChatSchema); // Model name should match usage in code
module.exports = Chat;
