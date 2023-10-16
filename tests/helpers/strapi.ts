import Strapi from "@strapi/strapi";
import _ from "lodash";

// Strapi Object
let instance: any;

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const waitForServer = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const onListen = async (error: Error) => {
      if (error) {
        reject(error);
      }

      try {
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };

    // TODO socket underfined
    const listenSocket = strapi.config.get("server.socket");

    if (listenSocket) {
      // @ts-ignore
      strapi.server.listen(listenSocket, onListen);
    } else {
      // @ts-ignore
      const { host, port } = strapi.config.get("server");
      // @ts-ignore
      strapi.server.listen(port, host, onListen);
    }
  });

/**
 * Setups strapi for futher testing
 */
export async function setupStrapi() {
  if (!instance) {
    /** the follwing code in copied from `./node_modules/strapi/lib/Strapi.js` */
    try {
      await Strapi.compile();
      await Strapi({
        appDir: process.cwd(),
        distDir: process.cwd() + "/dist",
        autoReload: false,
        serveAdminPanel: false,
      }).load();
    } catch (er) {
      console.log("er", er);
    }
    await waitForServer();

    instance = strapi; // strapi is global now
  }
  return instance;
}

/**
 * Closes strapi after testing
 */
export async function stopStrapi() {
  if (instance) {
    instance.destroy();

    // const tmpDbFile = strapi.config.get(
    //   "database.connection.connection.filename"
    // );
    // // @ts-ignore
    // if (fs.existsSync(tmpDbFile)) {
    //   // @ts-ignore
    //   fs.unlinkSync(tmpDbFile);
    // }
  }
  return instance;
}

/**
 * Returns valid JWT token for authenticated
 * @param {String | number} idOrEmail, either user id, or email
 */
interface IJwt {
  id?: number;
  email?: string;
}

export const jwt = (idOrEmail: IJwt) =>
  strapi.plugins["users-permissions"].services.jwt.issue({
    [Number.isInteger(idOrEmail) ? "id" : "email"]: idOrEmail,
  });

/**
 * Grants database `permissions` table that role can access an endpoint/controllers
 *
 * @param {int} roleID, 1 Autentihected, 2 Public, etc
 * @param {string} value, in form or dot string eg `"permissions.users-permissions.controllers.auth.changepassword"`
 * @param {boolean} enabled, default true
 * @param {string} policy, default ''
 */
export const grantPrivilege = async (
  roleID = 1,
  path: string,
  enabled = true,
  policy = ""
) => {
  const service = strapi.plugin("users-permissions").service("role");

  const role = await service.findOne(roleID);
  console.log("role.permissions object", role.permissions);
  _.set(role.permissions, path, { enabled, policy });

  return service.updateRole(roleID, role);
};

/** Updates database `permissions` that role can access an endpoint
 * @see grantPrivilege
 */

export const grantPrivileges = async (roleID = 1, values = []) => {
  await Promise.all(values.map((val) => grantPrivilege(roleID, val)));
};

/**
 * Updates the core of strapi
 * @param {*} pluginName
 * @param {*} key
 * @param {*} newValues
 * @param {*} environment
 */
export const updatePluginStore = async (
  pluginName,
  key,
  newValues,
  environment = ""
) => {
  const pluginStore = strapi.store({
    environment: environment,
    type: "plugin",
    name: pluginName,
  });

  const oldValues = await pluginStore.get({ key });
  const newValue = Object.assign({}, oldValues, newValues);

  return pluginStore.set({ key: key, value: newValue });
};

/**
 * Get plugin settings from store
 * @param {*} pluginName
 * @param {*} key
 * @param {*} environment
 */
export const getPluginStore = (pluginName, key, environment = "") => {
  const pluginStore = strapi.store({
    environment: environment,
    type: "plugin",
    name: pluginName,
  });

  return pluginStore.get({ key });
};

/**
 * Check if response error contains error with given ID
 * @param {string} errorId ID of given error
 * @param {object} response Response object from strapi controller
 * @example
 *
 * const response =  {
      data: null,
      error: {
        status: 400,
        name: 'ApplicationError',
        message: 'Your account email is not confirmed',
        details: {}
      }
    }
 * responseHasError("ApplicationError", response) // true
 */
export const responseHasError = (errorId, response) => {
  return response && response.error && response.error.name === errorId;
};

export default {
  setupStrapi,
  stopStrapi,
  jwt,
  grantPrivilege,
  grantPrivileges,
  updatePluginStore,
  getPluginStore,
  responseHasError,
  sleep,
};
