// 课程分类 controller
const createCrudController = require("../../lib/crud-controller");

module.exports = (app) =>
  createCrudController(app, { serviceName: "course.course-category", mainKey: "categoryId" });
