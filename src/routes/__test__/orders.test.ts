import supertest from "supertest";
import app from "../../app";
import { listProducts } from "../../controllers/product";

describe("Orders route tests", () => {
  describe("POST /api/orders", () => {
    it("not creates an empty cart", async () => {
      const response = await supertest(app).post("/api/orders").send({
        items: [],
      });

      expect(response.status).toBe(400);
    });

    it("not creates a cart with non existing products", async () => {
      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: [{ productId: "non-existing-product-id", quantity: 1 }],
        });

      expect(response.status).toBe(400);
    });

    it("creates a cart with existing products", async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "OPEN",
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
      });
    });

    it("creates a cart but skip non existing products", async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: [
            ...products.map((product) => ({
              productId: product.id,
              quantity: 1,
            })),
            { productId: "non-existing-product-id", quantity: 1 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "OPEN",
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
      });
      expect(response.body.CartEntries.length).toBe(products.length);
    });
  });
});
