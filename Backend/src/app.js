import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "../src/routes/auth.routes.js"; // Fixed path (removed extra quotes if needed)
import chatRoute from "../src/routes/chat.routes.js"; // Fixed path
const app = express();

// CORS Configuration: Essential for frontend requests with credentials (cookies)
app.use(
  cors({
    origin: [
      "https://chatgpt-2-0-esui.onrender.com", // Adjust if your frontend is on a different port (e.g., 3001 for CRA/Vite)
      // Common for React dev servers
      // Add more origins for production, e.g., 'https://yourdomain.com'
    ],
    credentials: true, // Allows cookies/credentials (matches frontend's 'include'/'withCredentials: true')
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allow common methods, including preflight OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Allow necessary headers
    exposedHeaders: ["Set-Cookie"], // Expose cookies in responses if needed
  })
);

// Middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies (added limit for safety)

app.use(cookieParser()) // Parse cookies (already good for auth)
// Routes

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
// Optional: Health check endpoint for testing
export default app;
