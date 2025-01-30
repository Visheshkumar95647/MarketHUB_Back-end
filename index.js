const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join("ProfileImage")));
app.use(express.static(path.join("ProductImage")));
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Database Connected");
    const server = app.listen(5000, () => {
      console.log("Server is running on PORT 5000");
    });
    // this develop the connection
    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: process.env.ORIGIN,
      },
    });

    //create connection
    // This line listens for any incoming connections from a client
    io.on("connection", (socket) => {
      console.log("Connected to socket.io");

      // User setup: joining a room based on their unique user ID
      socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(`User joined room with ID: ${userData._id}`);
        socket.emit("connected");
      });

      // User joins a chat room
      socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`User joined chat room: ${room}`);
      });

      // Handle new message received
      socket.on("new message", async (newMessageReceived) => {
        const chat = await newMessageReceived.chatId;
        
        // Check if the chat and users exist, and the chat has more than one user
        if (!chat || !chat.users || chat.users.length <= 1) {
            return console.log("Chat is invalid or not properly defined.");
        }
    
        // Loop through the chat users to find the recipient (exclude the sender)
        chat.users.forEach(user => {
            // If the user is not the sender, send the message to that user
            if (user._id !== newMessageReceived.sender._id) {
                console.log(`Sending message to user: ${user._id}`);
                console.log("Received message:", newMessageReceived);
    
                // Emit the message to the recipient (the other user in the chat)
                socket.in(user._id).emit("message received", newMessageReceived);
            }
        });
    });
    
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

app.use(require("./Routes/UserRoutes"));
app.use(require("./Routes/chatRoutes"));
app.use(require("./Routes/MessageRoutes"));
