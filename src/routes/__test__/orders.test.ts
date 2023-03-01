import supertest from "supertest";
import app from "../../app";
import { listProducts } from "../../controllers/product";
import prisma from "../../database";

describe("Orders route tests", () => {
  beforeAll(async () => {
    prisma.cart.deleteMany();
    prisma.cartEntries.deleteMany();
  });

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

  describe("GET /api/orders/:id", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("returns a cart", async () => {
      const response = await supertest(app).get(`/api/orders/${cartId}`);

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
        price: expect.any(Number),
      });
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app).get(`/api/orders/invalid-id`);

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/orders/:id", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("updates a cart by changing amount", async () => {
      const { body } = await supertest(app).get(`/api/orders/${cartId}`);

      const oldEntry = { ...body.CartEntries[0] };

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [
            {
              productId: oldEntry.productId,
              quantity: oldEntry.quantity + 1,
            },
          ],
        });

      expect(response.status).toBe(200);
      const updatedEntry = response.body.CartEntries.find(
        (entry: any) => entry.productId === oldEntry.productId
      );
      expect(updatedEntry.quantity).toBe(oldEntry.quantity + 1);
    });

    it("updates a cart by adding new products", async () => {
      const products = await listProducts(1, 5, "");

      const product = products[0];

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [
            {
              productId: product.id,
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(200);
      const updatedEntry = response.body.CartEntries.find(
        (entry: any) => entry.productId === product.id
      );
      expect(updatedEntry.quantity).toBe(1);
    });

    it("removes item by setting quantity to 0", async () => {
      const { body } = await supertest(app).get(`/api/orders/${cartId}`);

      const oldEntry = { ...body.CartEntries[0] };

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [
            {
              productId: oldEntry.productId,
              quantity: 0,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.CartEntries.length).toBe(
        body.CartEntries.length - 1
      );
      expect(
        response.body.CartEntries.find(
          (entry: any) => entry.productId === oldEntry.productId
        )
      ).toBeUndefined();
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app)
        .patch(`/api/orders/invalid-id`)
        .send({
          items: [
            {
              productId: "some-product-id",
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(404);
    });

    it("returns 400 if product does not exist", async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [
            {
              productId: "some-product-id",
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/orders/:id", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("cancel a cart", async () => {
      const response = await supertest(app).delete(`/api/orders/${cartId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "CANCELLED",
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
      });

      const { body } = await supertest(app).get(`/api/orders/${cartId}`);

      expect(body.status).toBe("CANCELLED");
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app).delete(`/api/orders/invalid-id`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/orders/:id/checkout", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("checkout a cart", async () => {
      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "SENT",
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
        price: expect.any(Number),
      });
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app).post(
        `/api/orders/invalid-id/checkout`
      );

      expect(response.status).toBe(404);
    });

    it("returns 400 if cart is empty", async () => {
      const originalOrder = await supertest(app).get(`/api/orders/${cartId}`);

      await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: originalOrder.body.CartEntries.map((entry: any) => ({
            productId: entry.productId,
            quantity: 0,
          })),
        });

      const response = await supertest(app).post(
        `/api/orders/${cartId}/checkout`
      );

      expect(response.status).toBe(400);
    });

    it("returns 400 for updating the cart after checkout", async () => {
      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .send({});

      expect(response.status).toBe(200);

      const product = await listProducts(1, 6, "");

      const updateResponse = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [
            {
              productId: product[0].id,
              quantity: 1,
            },
          ],
        });

      expect(updateResponse.status).toBe(400);
    });
  });
});
