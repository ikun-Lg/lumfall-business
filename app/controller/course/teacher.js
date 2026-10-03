// 讲师管理 controller
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "course.teacher", mainKey: "teacherId" });
