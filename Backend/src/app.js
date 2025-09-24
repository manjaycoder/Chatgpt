import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';  // Add for __dirname polyfill in ESM

// Polyfill __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoute from './routes/auth.routes.js';  // Fixed: relative path from src/app.js
import chatRoute from './routes/chat.routes.js'; // Fixed: relative path from src/app.js

const app = express();

// CORS Configuration: Essential for frontend requests with credentials (cookies)
app.use(cors({
  origin: [
    'https://chatgpt-2-0-esui.onrender.com',  // Your Render frontend URL (adjust if needed)
    // Add more for dev/prod, e.g., 'http://localhost:3000' for local React
  ],
  credentials: true,  // Allows cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Serve static files (e.g., CSS/JS/images from public/)
app.use(express.static(path.join(__dirname, "../public")));  // Fixed: uses polyfilled __dirname

// Middleware
app.use(express.json({ limit: '10mb' }));  // Parse JSON bodies
app.use(cookieParser());  // Parse cookies for auth

// Routes
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);

// Catch-all route for SPA (Single Page App) - serve index.html for all non-API routes
app.get("*", (req, res) => {  // Fixed: "*" instead of "*name"
  res.sendFile(path.join(__dirname, "../public/index.html"));  // Fixed: uses polyfilled __dirname
});

// Optional: 404 handler for unmatched routes (after catch-all if needed)
// app.use((req, res) => {
//   res.status(404).send('Not Found');
// });

// Optional: Error handler middleware (add at the end)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

export default app;
