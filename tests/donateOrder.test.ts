import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import { setupStrapi, stopStrapi, sleep } from "./helpers/strapi";
import {
  createUser,
  defaultData,
  mockUserData,
  createOrder,
} from "./user/factory";
import { Order, OrderItem, OrderMeta } from "./user/factory";

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
}, 1000000);

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("testing", () => {
  it("strapi is defined", () => {
    expect(strapi).toBeDefined();
  });
});

describe("create order", () => {
  it("should create an order", async () => {
    const order = await createOrder({
      user: 1,
      status: "processing",
      type: "donation",
      order_items: [
        {
          id: 1,
          quantity: 1,
          createdAt: "2022-01-01T00:00:00.000Z",
          updatedAt: "2022-01-01T00:00:00.000Z",
          sku: "12345",
          price: 1,
        },
      ],
      order_meta: {
        id: 1,
        shipping_postcode: "12345",
        shipping_firstname: "John",
        createdAt: "2022-01-01T00:00:00.000Z",
        updatedAt: "2022-01-01T00:00:00.000Z",
      },
    });

    expect(order).toBeDefined();
  });
});

describe("donateOrder", () => {
  it("should donate an order", async () => {});
});
