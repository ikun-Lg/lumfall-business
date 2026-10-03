// 会员管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "customer",
    mainKey: "customerId",
    idPrefix: "M",
    idLength: 5,
  });
