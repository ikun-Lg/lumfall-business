// 商品管理：基于 store 的 product 集合。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "product",
    mainKey: "productId",
    idPrefix: "P",
    idLength: 6,
  });
