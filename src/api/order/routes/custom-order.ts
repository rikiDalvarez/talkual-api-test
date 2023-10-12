export default {
  routes: [
    {
      method: "POST",
      path: "/orders/:id/donate",
      handler: "order.donate",
    },
    {
      method: "GET",
      path: "/orders/",
      handler: "order.getOrders",
    },
  ],
};
