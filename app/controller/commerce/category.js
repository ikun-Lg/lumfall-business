// 商品分类 controller
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "commerce.category", mainKey: "categoryId" });
