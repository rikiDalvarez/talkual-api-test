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

        //create new pedido with status processing, type donation

        const newOrderDonation = await orderService.create({
          data: {
            status: "processing",
            type: "donation",
          },
        });
        console.log(newOrderDonation);

        // const orders = await orderService.find({});
        // console.log("orders", orders);

        if (!isValidPostalCode(order_meta.shipping_postcode)) {
          return "Código postal inválido";
        }

        //create new pedido with status processing, type donation

        //create new orderMeta with data from request body  and link with new order

        //create new orderItem link with new Order

        //send confirmation email to user

        sendConfirmationEmail(order_meta.shipping_firstname);

        return {
          order,
          order_meta,
          authenticatedUser,
          sanitizedQueryParams,
        };
      } catch (error) {
        console.error("Error exporting orders", error);
        return (ctx.status = 500);
      }
    },
  })
);
