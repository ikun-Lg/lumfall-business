// 订单管理 controller（含 PATCH 状态流转）
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "commerce.order", mainKey: "orderId" });
