import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import initSocketServer from "./src/socket/socket.server.js";
import connectDb from "./src/db/db.js";
import http from "http";
// Create an HTTP server using the Express app
const httpServer = http.createServer(app);
// Connect to the database
connectDb();
const PORT = process.env.PORT || 3000;
// Initialize the socket server with the HTTP server
initSocketServer(httpServer);
// Start listening on the HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
