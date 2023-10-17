/**
 * order controller
 */
import { Context } from "koa";
import { ErrorHandler } from "../../../errorHandler";
import { donateOrder } from "../services/donateOrder";

import { factories } from "@strapi/strapi";
import { isValidPostalCode } from "../services/coverageService";
import { sendConfirmationEmail } from "../services/confirmationEmail";
import { Result } from "../../../../types/types";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async donate(ctx: Context): Promise<Result> {
      try {
        const { order_meta } = (ctx.request as any).body;
        const orderId = (ctx.request as any).params.id;

        if (!Number.isInteger(Number(orderId))) {
          const error = new ErrorHandler("bad_orderId");
          throw error;
        }

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          const error = new ErrorHandler("bad_order_meta");
          throw error;
        }
        const result = await donateOrder(ctx);

        sendConfirmationEmail(order_meta.shipping_firstname);

        return result;
      } catch (error) {
        switch (error.name) {
          case "bad_orderId":
            ctx.throw(400, "orderID inválida.");
            break;
          case "bad_order_meta":
            ctx.throw(400, "Código postal inválido");
            break;
          case "order_cancelled":
            ctx.throw(400, "El pedido slecionado ya esta cancelado");
            break;
        }
      }
    },
  })
);
