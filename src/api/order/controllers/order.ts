/**
 * order controller
 */
import { Request } from "koa";
import { ErrorHandler } from "../../../errorHandler";
import { donateOrder } from "../services/donateOrder";

import { factories } from "@strapi/strapi";
import { isValidPostalCode } from "../services/coverageService";
import { sendConfirmationEmail } from "../services/confirmationEmail";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async donate(ctx): Promise<any> {
      try {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);

        const { order_meta } = (ctx.request as any).body;
        const orderId = (ctx.request as any).params.id;

        const orderService = strapi.service("api::order.order");
        //TODO Add order interface
        //validation
        if (!Number.isInteger(Number(orderId))) {
          const error = new ErrorHandler("bad_orderId");
          throw error;
        }

        const order = await orderService.findOne(orderId, {
          populate: ["order_items", "order_meta"],
        });

        if (!order) {
          const error = new ErrorHandler("bad_orderId");
          throw error;
        }

        if (order.status === "cancelled") {
          const error = new ErrorHandler("order_cancelled");
          throw error;
        }

        let test = donateOrder(ctx);
        console.log("test", test);

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          const error = new ErrorHandler("bad_order_meta");
          throw error;
        }

        sendConfirmationEmail(order_meta.shipping_firstname);
        return test;
        // return {
        //   order: newOrderDonation,
        //   order_meta: {
        //     shipping_postcode: newOrderMeta.shipping_postcode,
        //     shipping_firstname: newOrderMeta.shipping_firstname,
        //   },
        // };
      } catch (error) {
        switch (error.name) {
          case "bad_orderId":
            ctx.throw(400, "orderID inválida.");
            break;
          case "bad_order_meta":
            ctx.throw(400, "Código postal inválido");
            break;
          case "order_cancelled":
            ctx.throw(400, "El pedido slecionado esta cancelado");
            break;
        }
      }
    },
  })
);
