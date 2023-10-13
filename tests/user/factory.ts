/**
 * Default data that factory use
 */
export const defaultData = {
  password: "1234Abc",
  provider: "local",
  confirmed: false,
};

export const AUTHENTICATED_ROLE = "authenticated";

/**
 * Returns random username object for user creation
 * @param {object} options that overwrites default options
 * @returns {object} object that is used with `strapi.plugins["users-permissions"].services.user.add`
 */
export const mockUserData = (options = {}) => {
  const usernameSuffix = Math.round(Math.random() * 10000).toString();
  return {
    username: `tester${usernameSuffix}`,
    email: `tester${usernameSuffix}@strapi.com`,
    ...defaultData,
    ...options,
  };
};

/**
 * Creates new user in strapi database
 * @param data
 * @returns {object} object of new created user, fetched from database
 */
export const createUser = async (data) => {
  /** Gets the default user role */
  const pluginStore = await strapi.store({
    type: "plugin",
    name: "users-permissions",
  });

  const settings: any = await pluginStore.get({
    key: AUTHENTICATED_ROLE,
  });

  const defaultRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: { type: settings ? settings.default_role : AUTHENTICATED_ROLE },
    });

  /** Creates a new user and push to database */
  return strapi
    .plugin("users-permissions")
    .service("user")
    .add({
      ...mockUserData(),
      ...data,
      role: defaultRole ? defaultRole.id : null,
    });
};

export interface Order {
  id: number;
  user: number;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  order_items: OrderItem[];
  order_meta: OrderMeta;
}
export interface OrderItem {
  id: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  sku: string;
  price: number;
}

export interface OrderMeta {
  id: number;
  shipping_postcode: string;
  shipping_firstname: string;
  createdAt: string;
  updatedAt: string;
}

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  try {
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const settings: any = await pluginStore.get({
      key: AUTHENTICATED_ROLE,
    });

    const defaultRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: settings ? settings.default_role : AUTHENTICATED_ROLE },
      });

    return strapi
      .plugin("users-permissions")
      .service("api::order.order")
      .create({ data: orderData });

    const orderModel = strapi.service("api::order.order");

    const createdOrder = await orderModel.create({ data: orderData });
    /**
      return strapi
    .plugin("users-permissions")
    .service("user")
    .add({
      ...mockUserData(),
      ...data,
      role: defaultRole ? defaultRole.id : null,
    });
     */
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export default {
  createOrder,
  mockUserData,
  createUser,
  defaultData,
  AUTHENTICATED_ROLE,
};
