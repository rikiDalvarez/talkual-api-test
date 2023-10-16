/**
 * Default data that factory use
 */
export const defaultData = {
  password: "1234Abc",
  provider: "local",
  confirmed: true,
};

export const AUTHENTICATED_ROLE = "authenticated";

/**
 * Returns random username object for user creation
 * @param {object} options that overwrites default options
 * @returns {object} object that is used with `strapi.plugins["users-permissions"].services.user.add`
 */
export const mockUserData = () => {
  const usernameSuffix = Math.round(Math.random() * 10000).toString();
  return {
    username: `tester${usernameSuffix}`,
    email: `tester${usernameSuffix}@strapi.com`,
    ...defaultData,
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

export default {
  mockUserData,
  createUser,
  defaultData,
  AUTHENTICATED_ROLE,
};
