// 学员管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "student",
    mainKey: "studentId",
    idPrefix: "S",
    idLength: 5,
  });
