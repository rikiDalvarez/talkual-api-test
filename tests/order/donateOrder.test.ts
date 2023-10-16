import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import { setupStrapi, stopStrapi, sleep } from "../helpers/strapi";
import { createUser, defaultData, mockUserData } from "../user/factory";
import { IUser } from "../../types/types";

let user: IUser;
let authToken: string;

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
}, 1000000);

/** this code is called once before all the tests are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("testing strapi", () => {
  it("strapi is defined", () => {
    expect(strapi).toBeDefined();
  });
});

describe("create order", () => {
  beforeAll(async () => {
    user = await createUser({});
    console.log({ user });
  });

  it("should login user and return jwt token", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200);

    authToken = response.body.jwt;

    expect(authToken).toBeDefined();
  });

  it("should get a list of orders", async () => {
    const response = await request(strapi.server.httpServer)
      .get("/api/orders")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    console.log("orderList", response.body.data);
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      const order = response.body.data[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("attributes");
    }
  });

  it("should create a new order using the authenticated user", async () => {
    await request(strapi.server.httpServer)
      .post("/api/orders")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        data: {
          status: "processing",
          user: 1,
          type: "normal",
        },
      })
      .expect(200);
  });

  it("should create a user and create an order", async () => {});

  describe("donateOrder", () => {
    it("should donate an order", async () => {});
  });
});
