import authUser from "../middleware/auth.middleware.js"; // Ensure this exports a function that sets req.user
import {
  createChat,
  getMessages,
  getChats,
} from "../controller/chat.controller.js"; // Fixed path (plural 'controllers') and name
import express from "express";

const router = express.Router();

// POST /chats (or whatever base path) - create chat (this was line 7 causing the error)
router.post("/", authUser, createChat); // Now createChat is a valid function

// Add other routes here if needed, e.g.:
router.get("/", authUser, getChats);
router.get("/messages/:id", authUser, getMessages);

export default router;
