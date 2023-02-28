import supertest from "supertest";
import app from "../../app";

describe("Products route tests", () => {
  describe("GET /api/products", () => {
    it("should responde", async () => {
      const response = await supertest(app).get("/api/products");

      expect(response.status).toBe(200);
    });

    it("should responde with a list of products", async () => {
      const response = await supertest(app).get("/api/products");

      expect(response.body.length).toEqual(20);
      // TODO: check products
    });

    it("should responde with a list of products with a limit", async () => {
      const response = await supertest(app).get("/api/products?limit=5");

      expect(response.body.length).toEqual(5);
    });

    it("should responde with a list of products with a limit and offset", async () => {
      const response = await supertest(app).get(
        "/api/products?limit=5&offset=5"
      );

      expect(response.body.length).toEqual(5);
    });

    it("should responde with a list of products filtered by category", async () => {
      const response = await supertest(app).get("/api/products?category=fruit");

      expect(response.body.length).toEqual(10);
    });

    it("should responde with a list of products filtered by name", async () => {
      const response = await supertest(app).get("/api/products?name=apple");

      expect(response.body.length).toEqual(2);
    });

    it("should responde with a list of products filtered by name and category", async () => {
      const response = await supertest(app).get(
        "/api/products?name=apple&category=fruit"
      );

      expect(response.body.length).toEqual(1);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should responde", async () => {
      const response = await supertest(app).get("/api/products/1");

      expect(response.status).toBe(200);
    });

    it("should responde with a product", async () => {
      const response = await supertest(app).get("/api/products/1");

      expect(response.body.id).toEqual(1);
      expect(response.body.name).toEqual("Apple");
      expect(response.body.category).toEqual("fruit");
      expect(response.body.price).toEqual(1.5);
    });

    it("should responde with a 404 if product not found", async () => {
      const response = await supertest(app).get("/api/products/999");

      expect(response.status).toBe(404);
    });
  });
});
