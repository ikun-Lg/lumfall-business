// 订单管理：发货 / 取消等状态流转走通用 PATCH。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "order",
    mainKey: "orderId",
    idPrefix: "O",
    idLength: 6,
  });
