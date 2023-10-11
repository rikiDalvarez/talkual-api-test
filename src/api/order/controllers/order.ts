/**
 * order controller
 */

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
        const { order_meta } = ctx.request.body;
        const orderId = ctx.request.params.id;

        const orderService = strapi.service("api::order.order");
        const orderMetaService = strapi.service("api::order-meta.order-meta");
        const orderItemService = strapi.service("api::order-item.order-item");

        /***** Rest of the code here *****/

        const order = await orderService.findOne(orderId, {
          populate: ["order_items", "order_meta"],
        });

        order.status = "cancelled";

        //find pedido by id and update status to cancelled,

        const updatedOrder = await orderService.update(orderId, {
          data: {
            status: "cancelled",
          },
        });

        console.log("updatedOrder:", updatedOrder.id);

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

        const orderItemTest = await orderItemQuery.findMany({
          where: {
            order: {
              id: orderId,
            },
          },
        });

        console.log("test", orderItemTest);

        // const orderItemsToUpdate = await orderItemQuery.findMany({
        //   where: {
        //     "order.id": orderId,
        //   },
        // });

        // console.log("orderItemsToUpdate", orderItemsToUpdate);

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

        // const orderItemsToCreate = await orderItemService.find({
        //   order: newOrderDonation.id,
        //   populate: ["order", "order_meta"],
        // });

        await createBuilkOrderItems(orderItemTest);

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          return "Código postal inválido";
        }

        sendConfirmationEmail(order_meta.shipping_firstname);

        return {
          order,
          order_meta,
          authenticatedUser,
        };
      } catch (error) {
        console.error("Error exporting orders", error);
        return (ctx.status = 500);
      }
    },
  })
);
