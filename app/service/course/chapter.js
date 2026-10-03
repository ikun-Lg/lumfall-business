// 章节管理：删除前校验章节下是否仍有课时。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "chapter",
    mainKey: "chapterId",
    idPrefix: "CH",
    idLength: 4,
    enumField: "chapterName",
    validateRemove: (store, id) => {
      const used = store.collection("lesson").all().some((row) => row.chapterId === id);
      return used ? "删除失败，该章节下仍有课时，请先移除关联课时" : null;
    },
  });
