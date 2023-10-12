/**
 * order controller
 */
import { Request } from "koa";
import { ErrorHandler } from "../../../errorHandler";

import { factories } from "@strapi/strapi";
import { isValidPostalCode } from "../services/coverageService";
import { sendConfirmationEmail } from "../services/confirmationEmail";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async donate(ctx): Promise<any> {
      try {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);

        const authenticatedUser = ctx.state.user;
        const { order_meta } = (ctx.request as any).body;
        const orderId = (ctx.request as any).params.id;

        if (!Number.isInteger(Number(orderId))) {
          const error = new ErrorHandler("bad_orderId");
          throw error;
        }

        const orderService = strapi.service("api::order.order");
        const orderMetaService = strapi.service("api::order-meta.order-meta");
        const orderItemService = strapi.service("api::order-item.order-item");

        const order = await orderService.findOne(orderId, {
          populate: ["order_items", "order_meta"],
        });

        if (!order) {
          ctx.throw(404, "Order not found");
        }

        //find pedido by id and update status to cancelled,

        const updatedOrder = await orderService.update(orderId, {
          data: {
            status: "cancelled",
          },
        });

        console.log("updatedOrder", updatedOrder);
        //create new pedido with status processing, type donation

        const newOrderDonation = await orderService.create({
          data: {
            status: "processing",
            type: "donation",
            user: authenticatedUser.id,
          },
        });

        const newOrderMeta = await orderMetaService.create({
          data: {
            ...order_meta,
            order: newOrderDonation.id,
          },
        });

        const orderItemQuery = strapi.query("api::order-item.order-item");
        console.log("newTest", orderItemQuery);

        const orderItemList = await orderItemQuery.findMany({
          where: {
            order: {
              id: orderId,
            },
          },
        });

        //funcion privada del servicio
        const createBuilkOrderItems = async (list) => {
          for (const orderItem of list) {
            const newSku = Math.random().toString(36).substring(7);
            const newOrderItem = await orderItemService.create({
              data: {
                quantity: orderItem.quantity,
                sku: newSku,
                order: newOrderDonation.id,
                price: orderItem.price,
              },
            });
          }
        };

        await createBuilkOrderItems(orderItemList);

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          ctx.throw("Código postal inválido");
        }

        sendConfirmationEmail(order_meta.shipping_firstname);

        return {
          order,
        };
      } catch (error) {
        switch (error.name) {
          case "bad_orderId":
            ctx.throw(400, "Invalid orderId. Please provide a valid order ID.");
        }
      }
    },

    async getOrders(ctx): Promise<any> {
      try {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);

        const authenticatedUser = ctx.state.user;

        const orderService = strapi.service("api::order.order");

        const orders = await orderService.find({
          where: {
            user: authenticatedUser.id,
          },
          populate: ["order_items", "order_meta"],
        });

        return {
          orders,
          authenticatedUser,
        };
      } catch (error) {
        console.error("Error exporting orders", error);
        return (ctx.status = 500);
      }
    },
  })
);
