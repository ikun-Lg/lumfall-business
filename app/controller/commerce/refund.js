// 退款管理 controller（审核走 PATCH）
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "commerce.refund", mainKey: "refundId" });
