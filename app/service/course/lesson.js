// 课时（视频）管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "lesson",
    mainKey: "lessonId",
    idPrefix: "LS",
    idLength: 5,
  });
