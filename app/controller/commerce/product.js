// 商品管理 controller（schema 契约见 dsl-guide 6.6）
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "commerce.product", mainKey: "productId" });
