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
import app from "../src/app.js";
import userModel from "../src/models/user.model.js";

let mongoServer;

// Set JWT_SECRET for tests
process.env.JWT_SECRET = "test_jwt_secret_for_testing_12345";

describe("User Authentication API", () => {
  // Setup MongoDB Memory Server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  });

  // Clean up after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear users collection before each test
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe("POST /api/auth/register - User Registration", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        fullName: {
          firstName: "John",
          lastName: "Doe",
        },
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User  registered successfully"
      );
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty("_id");
      expect(response.body.user).toHaveProperty("fullName");
      expect(response.body.user.fullName.firstName).toBe("John");
      expect(response.body.user.fullName.lastName).toBe("Doe");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should not register user with existing email", async () => {
      const userData = {
        fullName: {
          firstName: "John",
          lastName: "Doe",
        },
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      // Register user first time
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register same user again
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("message", "User  already exists");
    });

    it("should return error for missing required fields", async () => {
      const incompleteData = {
        email: "test@example.com",
        // Missing fullName and password
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(incompleteData);

      // Controller will throw error due to destructuring undefined
      expect(response.status).toBe(500);
    });

    it("should hash the password before saving", async () => {
      const userData = {
        fullName: {
          firstName: "Jane",
          lastName: "Smith",
        },
        email: "jane.smith@example.com",
        password: "PlainPassword123",
      };

      await request(app).post("/api/auth/register").send(userData).expect(201);

      const user = await userModel.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it("should create user with correct fullName structure", async () => {
      const userData = {
        fullName: {
          firstName: "Alice",
          lastName: "Williams",
        },
        email: "alice@example.com",
        password: "Test@1234",
      };

      await request(app).post("/api/auth/register").send(userData).expect(201);

      const user = await userModel.findOne({ email: userData.email });
      expect(user.fullName.firstName).toBe("Alice");
      expect(user.fullName.lastName).toBe("Williams");
    });
  });

  describe("POST /api/auth/login - User Login", () => {
    beforeEach(async () => {
      // Register a user before each login test
      const userData = {
        fullName: {
          firstName: "John",
          lastName: "Doe",
        },
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      await request(app).post("/api/auth/register").send(userData);
    });

    it("should login successfully with correct credentials", async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body.user).toHaveProperty("email", loginData.email);
      expect(response.body.user).toHaveProperty("_id");
      expect(response.body.user).toHaveProperty("fullName");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should not login with incorrect email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });

    it("should not login with incorrect password", async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "WrongPassword123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });

    it("should set httpOnly cookie on successful login", async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toMatch(/HttpOnly/i);
    });

    it("should return user data without password on login", async () => {
      const loginData = {
        email: "john.doe@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user.fullName).toHaveProperty("firstName");
      expect(response.body.user.fullName).toHaveProperty("lastName");
    });
  });

  describe("JWT Token Tests", () => {
    it("should generate valid JWT token on registration", async () => {
      const userData = {
        fullName: {
          firstName: "Alice",
          lastName: "Williams",
        },
        email: "alice@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
      expect(tokenCookie).toBeDefined();

      const token = tokenCookie.split(";")[0].split("=")[1];
      expect(token).toBeTruthy();
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should generate valid JWT token on login", async () => {
      // Register user first
      const userData = {
        fullName: {
          firstName: "Bob",
          lastName: "Smith",
        },
        email: "bob@example.com",
        password: "Test@1234",
      };

      await request(app).post("/api/auth/register").send(userData);

      // Login
      const loginData = {
        email: "bob@example.com",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      const cookies = response.headers["set-cookie"];
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
      const token = tokenCookie.split(";")[0].split("=")[1];

      expect(token).toBeTruthy();
      expect(token.split(".").length).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty request body", async () => {
      const response = await request(app).post("/api/auth/register").send({});

      // Will get 500 due to destructuring error
      expect(response.status).toBe(500);
    });

    it("should handle missing password on login", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should handle malformed email", async () => {
      const userData = {
        fullName: {
          firstName: "Test",
          lastName: "User",
        },
        email: "not-an-email",
        password: "Test@1234",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      // Since your controller doesn't validate email format, it creates the user
      expect(response.status).toBe(201);
    });
  });
});
