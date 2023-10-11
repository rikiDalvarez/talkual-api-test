/**
 * order-item controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order-item.order-item",
  ({ strapi }) => ({
    async find(ctx): Promise<any> {
      try {
        const orderItems = strapi.service("api::order-item.order-item");
      } catch (error) {
        ctx.send({ error: "An error occurred" }, 500);
      }
    },
  })
);
