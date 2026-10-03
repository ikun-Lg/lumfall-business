// 课程分类：删除前校验是否仍被课程引用。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "courseCategory",
    mainKey: "categoryId",
    idPrefix: "CC",
    idLength: 3,
    enumField: "categoryName",
    validateRemove: (store, id) => {
      const used = store.collection("course").all().some((row) => row.categoryId === id);
      return used ? "删除失败，该分类下仍有课程，请先移除或迁移关联课程" : null;
    },
  });
