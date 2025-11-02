import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoute from "../src/routes/auth.routes.js";
import chatRoute from "../src/routes/chat.routes.js";

const app = express();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "https://chatgpt-2-0-esui.onrender.com", // Update to your frontend origin if different
      "http://localhost:3000", // Optional: for local dev
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// ✅ Export app (no extra quote!)
export default app;
