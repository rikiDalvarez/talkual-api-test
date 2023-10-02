import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import request from "supertest";
import {
  setupStrapi,
  stopStrapi,
  sleep,
} from "../helpers/strapi";
import { createUser, defaultData, mockUserData } from "./factory";

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
}, 1000000);

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("Default User methods", () => {
  let user;

  beforeAll(async () => {
    user = await createUser({});
  });

  it("should login user and return jwt token", async () => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then(async (data) => {
        expect(data.body.jwt).toBeDefined();
        const verified = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(data.body.jwt);

        expect(data.body.jwt === jwt || !!verified).toBe(true); // jwt does have a random seed, each issue can be different
      });
  });
});
