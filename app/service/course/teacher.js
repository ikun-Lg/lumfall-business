// 讲师管理：rating 字段在前端由业务扩展的 rate 表单控件编辑。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) =>
  createCrudService(app, {
    collection: "teacher",
    mainKey: "teacherId",
    idPrefix: "T",
    idLength: 3,
    enumField: "teacherName",
  });
