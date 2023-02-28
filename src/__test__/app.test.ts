import supertest from "supertest";
import app from "../app";

describe("App test", () => {
  it("should responde successfully", async () => {
    const response = await supertest(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Welcome to Webshop API!");
  });
});
