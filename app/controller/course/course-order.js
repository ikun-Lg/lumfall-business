// 课程订单 controller（退款流转走 PATCH）
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "course.course-order", mainKey: "courseOrderId" });
