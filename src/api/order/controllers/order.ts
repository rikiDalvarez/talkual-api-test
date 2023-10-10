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

        console.log({ order });
        console.log({ order_meta });

        //find pedido by id and update status to cancelled,

        const updatedOrder = await orderService.update(orderId, {
          data: {
            status: "cancelled",
          },
        });

        //create new pedido with status processing, type donation

        const newOrderDonation = await orderService.create({
          data: {
            status: "processing",
            type: "donation",
            // order_items: order.order_items,
            // order_meta: order.order_meta,
            // populate: ["order_items", "order_meta"],
          },
        });
        console.log(newOrderDonation);

        const newOrderMeta = await orderMetaService.create({
          data: {
            ...order_meta,
            order: newOrderDonation.id,
          },
        });

        console.log(newOrderMeta);

        // const orders = await orderService.find({});
        // console.log("orders", orders);

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          return "Código postal inválido";
        }

        //create new orderMeta with data from request body  and link with new order

        //create new orderItem link with new Order

        //send confirmation email to user

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
