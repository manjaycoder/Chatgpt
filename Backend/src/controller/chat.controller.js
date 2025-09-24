import chatModel from "../models/chat.model.js";
import expressAsyncHandler from "express-async-handler";
import messageModel from "../models/message.model.js";
const asyncHandler = expressAsyncHandler;

const createChat = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const user = req.user; // Assumes auth middleware sets this

  // Basic validation
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!user || !user._id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  const chat = await chatModel.create({
    user: user._id, // Adjust to 'users: [user._id]' if it's a group chat
    title: title.trim(),
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity || new Date(), // Fallback if not set in schema
    },
  });
});
const getChats=async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}
const getMessages=async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

export {createChat,getChats,getMessages}; // Default export (matches your routes import)
