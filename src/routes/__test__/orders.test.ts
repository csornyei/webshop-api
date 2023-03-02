import supertest from "supertest";
import argon2 from "argon2";
import app from "../../app";
import { listProducts } from "../../controllers/product";
import prisma from "../../database";

const getAuthHeader = async (email = "test@test.com") => {
  const { body } = await supertest(app).post("/api/auth/login").send({
    email,
    password: "Test123456789",
  });

  return `Bearer ${body.token}`;
};

describe("Orders route tests", () => {
  beforeAll(async () => {
    await prisma.cart.deleteMany();
    await prisma.cartEntries.deleteMany();

    const password = await argon2.hash("Test123456789");
    await prisma.user.upsert({
      where: {
        email: "test@test.com",
      },
      update: {
        email: "test@test.com",
        password,
        Cart: undefined,
      },
      create: {
        email: "test@test.com",
        password,
        Cart: undefined,
      },
    });

    await prisma.user.upsert({
      where: {
        email: "test2@test.com",
      },
      update: {
        email: "test2@test.com",
        password,
        Cart: undefined,
      },
      create: {
        email: "test2@test.com",
        password,
        Cart: undefined,
      },
    });
  });

  describe("POST /api/orders", () => {
    it("not creates a cart without authentication", async () => {
      const response = await supertest(app)
        .post("/api/orders")
        .send({
          items: [{ productId: "non-existing-product-id", quantity: 1 }],
        });

      expect(response.status).toBe(401);
    });
    it("not creates an empty cart", async () => {
      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
        .send({
          items: [],
        });

      expect(response.status).toBe(400);
    });

    it("not creates a cart with non existing products", async () => {
      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
        .send({
          items: [{ productId: "non-existing-product-id", quantity: 1 }],
        });

      expect(response.status).toBe(400);
    });

    it("creates a cart with existing products", async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
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
        userId: expect.any(String),
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            product: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
        price: expect.any(Number),
      });
    });

    it("creates a cart but skip non existing products", async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
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
        userId: expect.any(String),
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            product: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
        price: expect.any(Number),
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
        .set("Authorization", await getAuthHeader())
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("not returns a cart without authentication", async () => {
      const response = await supertest(app).get(`/api/orders/${cartId}`);

      expect(response.status).toBe(401);
    });

    it("returns a cart", async () => {
      const response = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "OPEN",
        userId: expect.any(String),
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            product: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
        price: expect.any(Number),
      });
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app)
        .get(`/api/orders/invalid-id`)
        .set("Authorization", await getAuthHeader());

      expect(response.status).toBe(404);
    });

    it("returns 401 if cart does not belong to user", async () => {
      const response = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader("test2@test.com"));

      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/orders/:id", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("not updates a cart without authentication", async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .send({
          items: [{ productId: "non-existing-product-id", quantity: 1 }],
        });

      expect(response.status).toBe(401);
    });

    it("updates a cart by changing amount", async () => {
      const { body } = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      const oldEntry = { ...body.CartEntries[0] };

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
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
      expect(updatedEntry).toBeDefined();
      expect(updatedEntry.quantity).toBe(oldEntry.quantity + 1);
    });

    it("updates a cart by adding new products", async () => {
      const products = await listProducts(1, 10, "");

      const product = products[0];

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
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
      const { body } = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      const oldEntry = { ...body.CartEntries[0] };

      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
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
        .set("Authorization", await getAuthHeader())
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

    it("only updates existing products", async () => {
      const products = await listProducts(1, 10, "");
      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
        .send({
          items: [
            {
              productId: products[0].id,
              quantity: 1,
            },
            {
              productId: "some-product-id",
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.CartEntries.length).toBe(6);
      expect(
        response.body.CartEntries.find(
          (entry: any) => entry.productId === products[0].id
        )
      ).toBeDefined();
      expect(
        response.body.CartEntries.find(
          (entry: any) => entry.productId === "some-product-id"
        )
      ).toBeUndefined();
    });

    it("returns 401 if cart does not belong to user", async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader("test2@test.com"))
        .send({
          items: [
            {
              productId: "some-product-id",
              quantity: 1,
            },
          ],
        });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/orders/:id", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("not cancels a cart without authentication", async () => {
      const response = await supertest(app).delete(`/api/orders/${cartId}`);

      expect(response.status).toBe(401);
    });

    it("cancel a cart", async () => {
      const response = await supertest(app)
        .delete(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "CANCELLED",
        userId: expect.any(String),
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            product: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
      });

      const { body } = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      expect(body.status).toBe("CANCELLED");
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app)
        .delete(`/api/orders/invalid-id`)
        .set("Authorization", await getAuthHeader());

      expect(response.status).toBe(404);
    });

    it("returns 401 if cart does not belong to user", async () => {
      const response = await supertest(app)
        .delete(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader("test2@test.com"));

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/orders/:id/checkout", () => {
    let cartId: string;

    beforeEach(async () => {
      const products = await listProducts(5, 0, "");

      const response = await supertest(app)
        .post("/api/orders")
        .set("Authorization", await getAuthHeader())
        .send({
          items: products.map((product) => ({
            productId: product.id,
            quantity: 1,
          })),
        });

      cartId = response.body.id;
    });

    it("not checkout a cart without authentication", async () => {
      const response = await supertest(app).post(
        `/api/orders/${cartId}/checkout`
      );

      expect(response.status).toBe(401);
    });

    it("checkout a cart", async () => {
      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader())
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        status: "SENT",
        userId: expect.any(String),
        CartEntries: expect.arrayContaining([
          expect.objectContaining({
            product: expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number),
            }),
            productId: expect.any(String),
            quantity: expect.any(Number),
          }),
        ]),
        price: expect.any(Number),
      });
    });

    it("returns 404 if cart does not exist", async () => {
      const response = await supertest(app)
        .post(`/api/orders/invalid-id/checkout`)
        .set("Authorization", await getAuthHeader());

      expect(response.status).toBe(404);
    });

    it("returns 400 if cart is empty", async () => {
      const originalOrder = await supertest(app)
        .get(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader());

      await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
        .send({
          items: originalOrder.body.CartEntries.map((entry: any) => ({
            productId: entry.productId,
            quantity: 0,
          })),
        });

      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader());
      expect(response.status).toBe(400);
    });

    it("returns 400 if the cart not open", async () => {
      const firstResponse = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader());

      expect(firstResponse.status).toBe(200);

      const secondResponse = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader());

      expect(secondResponse.status).toBe(400);
    });

    it("returns 400 for updating the cart after checkout", async () => {
      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader())
        .send({});

      expect(response.status).toBe(200);

      const product = await listProducts(1, 6, "");

      const updateResponse = await supertest(app)
        .patch(`/api/orders/${cartId}`)
        .set("Authorization", await getAuthHeader())
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

    it("returns 401 if cart does not belong to user", async () => {
      const response = await supertest(app)
        .post(`/api/orders/${cartId}/checkout`)
        .set("Authorization", await getAuthHeader("test2@test.com"))
        .send({});

      expect(response.status).toBe(401);
    });
  });
});
