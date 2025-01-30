const express = require("express");
const VerifyToken = require("../middleware");
const router = express.Router();
const Chat = require("../Models/ChatModel");
const User = require("../Models/UserSchema");

// Create or fetch a chat
router.post("/createchat/:id", VerifyToken ,  async (req, res) => {
  const userid = req.params.id;
  const loginUserid = req.user.id;
  if (!userid) {
    return res.status(400).json({ message: "UserId parameter not provided" });
  }
  //find if chat already exists

  try {
    let chat = await Chat.findOne({
      isGroup: false, // as one and one chat
      $and: [
        { users: { $elemMatch: { $eq: loginUserid } } },
        { users: { $elemMatch: { $eq: userid } } },
      ],
      // here we find that is any chat exist where these two user present
    })
      // {
      //   "_id": "chatId1",
      //   "chatName": "Chat Room",
      //   "isGroup": false,
      //   "users": [loginUserid, "userid123"],
      //   "latestMessage": "messageId1", // The ID of the latest message
      //   "groupAdmin": "someUserId",
      //   "createdAt": "2024-10-05T12:00:00Z",
      //   "updatedAt": "2024-10-05T12:01:00Z"
      // }

      // here the chat look like this and the after that wew populate which simply place the data in place of id:
      .populate("users", "-password") // Populate users but exclude password field
      .populate("latestMessage");

    //after that the latest message contain the schema of message

    //     "latestMessage": {
    //   "_id": "messageId1",
    //   "sender": "userid123", // The ObjectId referencing the User
    //   "chat": "chatId1",     // The ObjectId referencing the Chat
    //   "content": "Hey there!", // The actual message content
    //   "createdAt": "2024-10-05T12:01:00Z",
    //   "updatedAt": "2024-10-05T12:01:00Z"
    // },

    // to extract further we need to populate it again
    //here we populate it from user path is latestmessage.sender because this sender contain id of the user
    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "username image",
    });

    if (chat) {
      return res.status(200).send(chat);
    } else {
      // Create a new chat if it doesn't exist
      const chatData = {
        chatName: req.body.chatName,
        isGroup: false,
        users: [loginUserid, userid],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate(
        "users",
        "-password"
      );

      return res.status(200).send(fullChat);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error occurred" });
  }
});

// Additional routes
// Uncomment and complete the following routes as needed

//Get All Chats
router.get("/allchats",VerifyToken, async (req, res) => {
  const loginUserid = req.user.id;
  try {
    Chat.find({ users: { $elemMatch : { $eq: loginUserid }} })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username image",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error occurred" });
  }
});

//Group Creation
// router.post("/group",VerifyToken, async (req, res) => {
//   if (!req.body.users || !req.body.chatName) {
//     return res.status(400).send({ message: "Please Fill All The Fields" });
//   }
//   var users = JSON.parse(req.body.users);
//   //if length is less than 2 means its 1 so its an one to one chat there is no use of grp chat
//   if (users.length <= 2) {
//     return res
//       .status(400)
//       .send({ message: "More Than Two Users Are Required" });
//   }

//   // users.push(req.user);
//   //current user that looged in.

//   try {
//     const groupChat = await Chat.create({
//       chatName: req.body.chatName,
//       users: users,
//       isGroup: true,
//       groupAdmin: req.user._id,
//     });
//     //fetching this grp chat and send to user
//     const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");

//     res.status(200).json(fullGroupChat);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error occurred" });
//   }
// });

 
// router.put("/grouprename/:id", VerifyToken, async (req, res) => {
//   try {
//     const chatId = req.params.id;
//     const { chatName } = req.body;

//     // Fetch the chat to check the group admin
//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({ error: "Chat not found" });
//     }

//     // Verify if the current user is the group admin
//     const currentUserId = req.user._id; // Assuming you attach the current user from the VerifyToken middleware
//     if (chat.groupAdmin.toString() !== currentUserId.toString()) {
//       return res.status(403).json({ error: "Only group admin can rename the group" });
//     }

//     // Proceed to rename the group
//     chat.chatName = chatName;
//     const updatedChat = await chat.save();

//     // Populate related fields (users, groupAdmin) before sending the response
//     await updatedChat
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password")
//       .execPopulate();

//     res.json(updatedChat);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// //Remove User From Group
// router.put("/groupremove/:id", VerifyToken, async (req, res) => {
//   const { userRemove } = req.body;
//   const chatId = req.params.id;
//   const chat = await Chat.findById(chatId);

//   if (chat.groupAdmin.toString() !== currentUserId.toString()) {
//     return res.status(403).json({ error: "Only group admin can remove from the group" });
//   }

//   const userToremove = await User.find({ userRemove });
//   const removeUser = await Chat.findById(
//     chatId,
//     {
//       $pull: { users: userToremove._id },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");
//   if (!removeUser) {
//     res.status(404);
//     throw new Erorr("User Not Found");
//   } else {
//     res.json(removeUser);
//   }
// });


// //Add user to Group
// router.put("/groupadd/:id", VerifyToken, async (req, res) => {
//   const { userAdd } = req.body;
//   const chatId = req.params.id;

//   const chat = await Chat.findById(chatId);

//   if (chat.groupAdmin.toString() !== currentUserId.toString()) {
//     return res.status(403).json({ error: "Only group admin can add user to the group" });
//   }

//   const userToAdd = await User.find({ userAdd });
//   const addUser = await Chat.findbyIdAndUpdate(
//     chatId,
//     {
//       $push: { users: userToAdd._id },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");
//   if (!addUser) {
//     res.status(404);
//     throw new Erorr("User Not Found");
//   } else {
//     res.json(addUser);
//   }
// });



module.exports = router;
