import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import { setupStrapi, stopStrapi, sleep } from "../helpers/strapi";
import { createUser, defaultData, mockUserData } from "../user/factory";

let user;
let authToken;

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
}, 1000000);

/** this code is called once before all the tests are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("testing", () => {
  it("strapi is defined", () => {
    expect(strapi).toBeDefined();
  });

  describe("create order", () => {
    beforeAll(async () => {
      user = await createUser({});
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
      console.log({ authToken });

      expect(authToken).toBeDefined();
    });

    it("should create a new order using the authenticated user", async () => {
      await request(strapi.server.httpServer)
        .get("/api/orders")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(200);
    });

    it("should create a user and create an order", async () => {});

    describe("donateOrder", () => {
      it("should donate an order", async () => {});
    });
  });
});
