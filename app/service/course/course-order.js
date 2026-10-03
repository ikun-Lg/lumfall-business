// 课程订单：退款状态流转走通用 PATCH。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "courseOrder",
    mainKey: "courseOrderId",
    idPrefix: "CO",
    idLength: 6,
  });
