// 商品分类：删除前校验分类是否仍被商品引用。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "category",
    mainKey: "categoryId",
    idPrefix: "C",
    idLength: 3,
    enumField: "categoryName",
    validateRemove: (store, id) => {
      const used = store.collection("product").all().some((row) => row.categoryId === id);
      return used ? "删除失败，该分类下仍有商品，请先移除或迁移关联商品" : null;
    },
  });
