import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { app } from "../server.js";
import chatModel from "../src/models/chat.model.js";
import messageModel from "../src/models/message.model.js";
import userModel from "../src/models/user.model.js";

let mongoServer;
let testUser;
let authToken;

// Set JWT_SECRET for tests
process.env.JWT_SECRET = "test_jwt_secret_for_testing_12345";

describe("Chat Controller API", () => {
  // Setup MongoDB Memory Server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    // Create a test user
    testUser = await userModel.create({
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
      email: "test@example.com",
      password: "hashedPassword123",
    });

    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
  });

  // Clean up after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear collections before each test
  beforeEach(async () => {
    await chatModel.deleteMany({});
    await messageModel.deleteMany({});
  });

  describe("POST /api/auth/chat - Create Chat", () => {
    it("should create a new chat successfully", async () => {
      const chatData = {
        title: "My First Chat",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send(chatData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Chat created successfully"
      );
      expect(response.body.chat).toHaveProperty("_id");
      expect(response.body.chat).toHaveProperty("title", "My First Chat");
      expect(response.body.chat).toHaveProperty("lastActivity");
    });

    it("should trim whitespace from title", async () => {
      const chatData = {
        title: "  Trimmed Chat  ",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send(chatData)
        .expect(201);

      expect(response.body.chat.title).toBe("Trimmed Chat");
    });

    it("should return error when title is missing", async () => {
      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("message", "Title is required");
    });

    it("should return error when title is empty string", async () => {
      const chatData = {
        title: "   ",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send(chatData)
        .expect(400);

      expect(response.body).toHaveProperty("message", "Title is required");
    });

    it("should return error when user is not authenticated", async () => {
      const chatData = {
        title: "Unauthorized Chat",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .send(chatData)
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });

    it("should associate chat with authenticated user", async () => {
      const chatData = {
        title: "User Association Test",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send(chatData)
        .expect(201);

      const chat = await chatModel.findById(response.body.chat._id);
      expect(chat.user.toString()).toBe(testUser._id.toString());
    });
  });

  describe("GET /api/auth/chat - Get All Chats", () => {
    beforeEach(async () => {
      // Create test chats
      await chatModel.create([
        { user: testUser._id, title: "Chat 1" },
        { user: testUser._id, title: "Chat 2" },
        { user: testUser._id, title: "Chat 3" },
      ]);
    });

    it("should retrieve all chats for authenticated user", async () => {
      const response = await request(app)
        .get("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Chats retrieved successfully"
      );
      expect(response.body.chats).toHaveLength(3);
      expect(response.body.chats[0]).toHaveProperty("_id");
      expect(response.body.chats[0]).toHaveProperty("title");
      expect(response.body.chats[0]).toHaveProperty("lastActivity");
      expect(response.body.chats[0]).toHaveProperty("user");
    });

    it("should return empty array when user has no chats", async () => {
      await chatModel.deleteMany({});

      const response = await request(app)
        .get("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      expect(response.body.chats).toHaveLength(0);
    });

    it("should only return chats belonging to authenticated user", async () => {
      // Create another user and their chat
      const otherUser = await userModel.create({
        fullName: { firstName: "Other", lastName: "User" },
        email: "other@example.com",
        password: "password123",
      });

      await chatModel.create({
        user: otherUser._id,
        title: "Other User Chat",
      });

      const response = await request(app)
        .get("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      // Should still have only 3 chats (from beforeEach)
      expect(response.body.chats).toHaveLength(3);

      // Verify all chats belong to testUser
      response.body.chats.forEach((chat) => {
        expect(chat.user.toString()).toBe(testUser._id.toString());
      });
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/api/auth/chat").expect(401);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/chat/:id/messages - Get Messages", () => {
    let testChat;

    beforeEach(async () => {
      // Create a test chat
      testChat = await chatModel.create({
        user: testUser._id,
        title: "Test Chat for Messages",
      });

      // Create test messages
      await messageModel.create([
        { chat: testChat._id, role: "user", content: "Hello" },
        { chat: testChat._id, role: "assistant", content: "Hi there!" },
        { chat: testChat._id, role: "user", content: "How are you?" },
      ]);
    });

    it("should retrieve all messages for a chat", async () => {
      const response = await request(app)
        .get(`/api/auth/chat/${testChat._id}/messages`)
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Messages retrieved successfully"
      );
      expect(response.body.messages).toHaveLength(3);
    });

    it("should return messages sorted by creation time", async () => {
      const response = await request(app)
        .get(`/api/auth/chat/${testChat._id}/messages`)
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      const messages = response.body.messages;
      expect(messages[0].content).toBe("Hello");
      expect(messages[1].content).toBe("Hi there!");
      expect(messages[2].content).toBe("How are you?");
    });

    it("should return empty array when chat has no messages", async () => {
      await messageModel.deleteMany({});

      const response = await request(app)
        .get(`/api/auth/chat/${testChat._id}/messages`)
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      expect(response.body.messages).toHaveLength(0);
    });

    it("should handle non-existent chat ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/auth/chat/${fakeId}/messages`)
        .set("Cookie", `token=${authToken}`)
        .expect(200);

      expect(response.body.messages).toHaveLength(0);
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await request(app)
        .get(`/api/auth/chat/${testChat._id}/messages`)
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid chat ID format", async () => {
      const response = await request(app)
        .get("/api/auth/chat/invalid-id/messages")
        .set("Cookie", `token=${authToken}`);

      // Should handle error gracefully
      expect([200, 400, 500]).toContain(response.status);
    });

    it("should handle very long chat titles", async () => {
      const longTitle = "A".repeat(500);

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send({ title: longTitle });

      // Should either accept or reject based on schema validation
      expect([201, 400]).toContain(response.status);
    });

    it("should handle special characters in chat title", async () => {
      const chatData = {
        title: "🚀 Test Chat with Emojis & Special chars!@#$%",
      };

      const response = await request(app)
        .post("/api/auth/chat")
        .set("Cookie", `token=${authToken}`)
        .send(chatData)
        .expect(201);

      expect(response.body.chat.title).toBe(chatData.title);
    });
  });
});
