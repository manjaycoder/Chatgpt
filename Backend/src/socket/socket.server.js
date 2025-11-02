import { Server } from "socket.io";
import cookie from "cookie";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { createMemory,queryMemory } from "../services/vector.service.js";
import  {generateResponse, generateVector } from "../services/ai.service.js";
import messageModel from "../models/message.model.js";
     function initSocketServer(httpServer) {
       const io = new Server(httpServer, {
         cors: {
           origin: "https://chatgpt-4-s8b8.onrender.com", // Replace with your client origin (e.g., "http://localhost:3001") for production security
           credentials: true // Allows cookies/credentials from cross-origin
         },
         transports: ["polling", "websocket"], // Force polling first for cookie transmission, then upgrade
         forceNew: true // Ensures fresh connection (helps with sticky sessions)
       });

       io.use(async (socket, next) => {
         console.log("Connection attempt via transport:", socket.conn.transport.name);
         console.log("Handshake headers:", socket.handshake.headers);
         
         const parsedCookies = cookie.parse(socket.handshake.headers?.cookie || "");
         console.log("Parsed cookies:", parsedCookies);
         
         if (!parsedCookies.token) {
           console.log("No token found—rejecting connection");
           return next(new Error("Authentication error: No token provided"));
         }
         
         try {
           const decoded = jwt.verify(parsedCookies.token, process.env.JWT_SECRET);
           const user = await userModel.findById(decoded.id);
           if (!user) {
             console.log("User  not found for ID:", decoded.id);
             return next(new Error("Authentication error: User not found"));
           }
           socket.user = user;
           console.log("User  authenticated:", user.email);
           next();
         } catch (error) {
           console.error("JWT verification error:", error.message);
           next(new Error("Authentication error: Invalid token"));
         }
       });

       io.on("connection", (socket) => {
         console.log("New socket connection established:", socket.id);
         console.log("Transport used:", socket.conn.transport.name);
         console.log("Connected user:", socket.user ? socket.user.email : "Unauthenticated");
         
      socket.on("ai-message", async (messagePayload) => {
  try {
    // 1️⃣ Validate payload
    if (!messagePayload || typeof messagePayload.content !== "string" || !messagePayload.content.trim()) {
      console.error("Invalid AI message payload:", messagePayload);
      return socket.emit("ai-error", { message: "Message content is required" });
    }

    if (!messagePayload.chat) {
      console.error("Chat ID missing in payload:", messagePayload);
      return socket.emit("ai-error", { message: "Chat ID is required" });
    }

    const content = messagePayload.content.trim();
    const chatId = messagePayload.chat;

    console.log("AI message received:", { chatId, content });

    // 2️⃣ Generate embedding vector
    let vectors;
    try {
      vectors = await generateVector(content);
      console.log("Vector generated:", vectors);
    } catch (error) {
      console.error("Vector generation failed:", error.message);
      socket.emit("ai-error", { message: "Failed to generate embedding vector" });
      return;
    }

    // 3️⃣ Fetch recent chat history (last 4 messages)
    const chatHistoryDocs = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const chatHistory = chatHistoryDocs.reverse().map((item) => ({
      role: item.role,
      parts: [{ text: item.content }]
    }));

    console.log("Chat history formatted:", chatHistory);

    // 4️⃣ Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateResponse(content); // currently string-based
      console.log("AI response generated:", aiResponse);
    } catch (error) {
      console.error("AI response generation failed:", error.message);
      socket.emit("ai-error", { message: "Failed to generate AI response" });
      return;
    }

    // 5️⃣ Optionally save messages to DB
    // await messageModel.create({
    //   chat: chatId,
    //   user: socket.user._id,
    //   content: content,
    //   role: "user"
    // });

    // await messageModel.create({
    //   chat: chatId,
    //   user: socket.user._id,
    //   content: aiResponse,
    //   role: "model"
    // });

    // 6️⃣ Emit AI response to client
    socket.emit("ai-response", {
      chat: chatId,
      content: aiResponse
    });

  } catch (error) {
    console.error("Unexpected error in ai-message handler:", error);
    socket.emit("ai-error", { message: "Internal server error" });
  }
});


         socket.on("disconnect", (reason) => {
           console.log("Socket disconnected:", socket.id, "Reason:", reason);
         });
       });
     }

     export default initSocketServer;
     