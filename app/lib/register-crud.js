// CRUD 路由注册 helper：把一个 api 基址的 6 条标准路由绑定到 controller。

/**
 * @param {object} router    koa-router 实例
 * @param {object} controller 含 list/getOne/create/update/patchOne/remove/enumList 方法的 controller
 * @param {object} options
 * @param {string} options.basePath api 基址（如 "/api/project/product"）
 * @param {string} [options.enumPath] 枚举选项接口路径；不传则不注册
 */
module.exports = function registerCrudRoutes(router, controller, { basePath, enumPath }) {
  const bind = (method) => controller[method].bind(controller);

  router.get(`${basePath}/list`, bind("list"));
  router.get(basePath, bind("getOne"));
  router.post(basePath, bind("create"));
  router.put(basePath, bind("update"));
  router.patch(basePath, bind("patchOne"));
  router.delete(basePath, bind("remove"));

  if (enumPath) {
    router.get(enumPath, bind("enumList"));
  }
};
