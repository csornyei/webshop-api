import supertest from "supertest";
import app from "../../app";
import { listProducts } from "../../controllers/product";

describe("Products route tests", () => {
  describe("GET /api/products", () => {
    it("should responde", async () => {
      const response = await supertest(app).get("/api/products");

      expect(response.status).toBe(200);
    });

    it("should responde with a list of products", async () => {
      const response = await supertest(app).get("/api/products");

      expect(response.body.length).toEqual(20);
      expect(
        response.body.every(
          (product: any) => product.name && product.id && product.price > 0
        )
      ).toBeTruthy();
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

    it("should responde with a list of products filtered by name", async () => {
      const response = await supertest(app).get("/api/products?q=apple");

      expect(response.body.length).toEqual(4);
    });
  });

  describe("GET /api/products/:id", () => {
    let productId: string;

    beforeAll(async () => {
      const apple = await listProducts(1, 0, "Red Apple");
      productId = apple[0].id!;
    });

    it("should responde", async () => {
      const response = await supertest(app).get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
    });

    it("should responde with a product", async () => {
      const response = await supertest(app).get(`/api/products/${productId}`);

      expect(response.body.name).toEqual("Red apple");
      expect(response.body.category.name).toEqual("Apples");
      expect(response.body.description).toEqual("A delicious red apple");
      expect(response.body.price).toEqual(1.5);
    });

    it("should responde with a 404 if product not found", async () => {
      const response = await supertest(app).get("/api/products/999");

      expect(response.status).toBe(404);
    });
  });
});
