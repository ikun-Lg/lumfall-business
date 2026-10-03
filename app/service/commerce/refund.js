// 退款管理：审核通过 / 拒绝走通用 PATCH（仅 admin 角色可见，由 DSL 菜单 roles 控制）。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "refund",
    mainKey: "refundId",
    idPrefix: "R",
    idLength: 5,
  });
