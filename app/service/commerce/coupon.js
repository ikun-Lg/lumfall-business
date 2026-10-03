// 优惠券管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "coupon",
    mainKey: "couponId",
    idPrefix: "CP",
    idLength: 4,
  });
