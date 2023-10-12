import { Context, Next } from "koa";
import { Strapi } from "@strapi/strapi";

module.exports = (strapi: Strapi) => {
  return {
    initialize() {
      strapi.app.use(async (ctx: Context, next: Next) => {
        try {
          await next();
        } catch (error) {
          // Handle the error here
          strapi.log.error(`Error: ${error.message}`);
          ctx.status = error.status || 500;
          ctx.body = {
            error: error.message,
          };
        }
      });
    },
  };
};
