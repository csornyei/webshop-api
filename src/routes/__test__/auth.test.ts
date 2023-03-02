import supertest from "supertest";
import argon2 from "argon2";
import app from "../../app";
import prisma from "../../database";

describe("Auth route tests", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();

    const users = await prisma.user.findMany();
    expect(users.length).toBe(0);
  });
  describe("POST /api/auth/login", () => {
    it("should return 400 if email is not provided", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ password: "password" });
      expect(response.status).toBe(400);
    });

    it("should return 400 if password is not provided", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com" });
      expect(response.status).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "test", password: "password" });
      expect(response.status).toBe(400);
    });

    it("should return 400 if password is invalid", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "p" });

      expect(response.status).toBe(400);
    });

    it("should return 404 if user does not exist", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "not-real-user@test.com", password: "Test123456789" });

      expect(response.status).toBe(404);
    });

    it("should return 404 if password is incorrect", async () => {
      const hashedPassword = await argon2.hash("Test123456789");
      await prisma.user.create({
        data: {
          email: "test-password-incorrect@test.com",
          password: hashedPassword,
        },
      });

      const response = await supertest(app).post("/api/auth/login").send({
        email: "test-password-incorrect@test.com",
        password: "Test1234567890",
      });

      expect(response.status).toBe(404);
    });

    it("should log the user in", async () => {
      const hashedPassword = await argon2.hash("Test123456789");
      await prisma.user.create({
        data: {
          email: "test-should-log-in@test.com",
          password: hashedPassword,
        },
      });

      const response = await supertest(app).post("/api/auth/login").send({
        email: "test-should-log-in@test.com",
        password: "Test123456789",
      });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if email is not provided", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        password: "Password1234",
        passwordConfirmation: "Password1234",
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if password is not provided", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "test@test.com",
        passwordConfirmation: "Password1234",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if passwordConfirmation is not provided", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "Password1234",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "test",
        password: "Password1234",
        passwordConfirmation: "Password1234",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if password is invalid", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "p",
        passwordConfirmation: "p",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if passwords do not match", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "Test123456789",
        passwordConfirmation: "Tets123456789",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if user already exists", async () => {
      const hashedPassword = await argon2.hash("Test123456789");
      await prisma.user.create({
        data: {
          email: "already-exists@test.com",
          password: hashedPassword,
        },
      });

      const response = await supertest(app).post("/api/auth/register").send({
        email: "already-exists@test.com",
        password: "Test123456789",
        passwordConfirmation: "Test123456789",
      });

      expect(response.status).toBe(400);
    });

    it("should register the user", async () => {
      const response = await supertest(app).post("/api/auth/register").send({
        email: "registered@test.com",
        password: "Test123456789",
        passwordConfirmation: "Test123456789",
      });

      expect(response.status).toBe(200);
    });
  });
});
