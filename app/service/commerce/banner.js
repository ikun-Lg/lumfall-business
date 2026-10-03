// 轮播图管理。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "banner",
    mainKey: "bannerId",
    idPrefix: "B",
    idLength: 3,
  });
