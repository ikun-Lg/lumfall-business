// 优惠券 controller
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "commerce.coupon", mainKey: "couponId" });
