import { ErrorHandler } from "../../../errorHandler";
import { Context } from "koa";
import { Order } from "../../../../types/types";

export async function donateOrder(ctx: Context) {
  const orderService = strapi.service("api::order.order");
  const orderMetaService = strapi.service("api::order-meta.order-meta");
  const orderItemService = strapi.service("api::order-item.order-item");

  const authenticatedUser = ctx.state.user;
  const { order_meta } = (ctx.request as any).body;
  const orderId = (ctx.request as any).params.id;

  try {
    const order = await orderService.findOne(orderId, {
      populate: ["order_items", "order_meta"],
    });
    console.log("order!", order);

    if (!order) {
      const error = new ErrorHandler("bad_orderId");
      throw error;
    }

    if (order.status === "cancelled") {
      const error = new ErrorHandler("order_cancelled");
      throw error;
    }

    await orderService.update(orderId, {
      data: {
        status: "cancelled",
      },
      populate: ["order_items", "order_meta"],
    });

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

    const createOrderItem = async (order: Order): Promise<void> => {
      const newSku = Math.random().toString(36).substring(7);
      await orderItemService.create({
        data: {
          quantity: order.order_items[0].quantity,
          sku: newSku,
          order: newOrderDonation.id,
          price: order.order_items[0].price,
        },
      });
    };

    await createOrderItem(order);

    return {
      order: newOrderDonation,
      order_meta: {
        shipping_postcode: newOrderMeta.shipping_postcode,
        shipping_firstname: newOrderMeta.shipping_firstname,
      },
    };
  } catch (error) {
    throw error;
  }
}
