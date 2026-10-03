// 学员管理 controller
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "course.student", mainKey: "studentId" });
