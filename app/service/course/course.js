// 课程管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "course",
    mainKey: "courseId",
    idPrefix: "CS",
    idLength: 3,
  });
