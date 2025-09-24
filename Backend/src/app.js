import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';  // For __dirname polyfill in ESM

// Polyfill __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoute from './routes/auth.routes.js';  // Relative path from src/app.js
import chatRoute from './routes/chat.routes.js'; // Relative path from src/app.js

const app = express();

// CORS Configuration: Essential for frontend requests with credentials (cookies)
app.use(cors({
  origin: [
    'https://chatgpt-2-0-esui.onrender.com',  // Your Render frontend URL (adjust if needed)
    // Add more for dev/prod, e.g., 'http://localhost:3000' for local React
  ],
  credentials: true,  // Allows cookies/credentials (matches frontend's 'include'/'withCredentials: true')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],  // Allow common methods, including preflight OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],  // Allow necessary headers
  exposedHeaders: ['Set-Cookie'],  // Expose cookies in responses if needed
}));

// Serve static files (e.g., CSS/JS/images from public/)
app.use(express.static(path.join(__dirname, "../public")));  // Uses polyfilled __dirname

// Middleware
app.use(express.json({ limit: '10mb' }));  // Parse JSON bodies (added limit for safety)
app.use(cookieParser());  // Parse cookies for auth

// Routes
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);

// Catch-all route for SPA (Single Page App) - serve index.html for all non-API routes
app.get("*", (req, res) => {  // "*" to match all routes
  res.sendFile(path.join(__dirname, "../public/index.html"));  // Uses polyfilled __dirname
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

// Optional: Health check endpoint for testing
// app.get('/health', (req, res) => res.send('OK'));

export default app;
