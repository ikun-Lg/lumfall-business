// 系统用户管理：用户名唯一；与登录账号池（app/service/auth.js）相互独立。
const createCrudService = require("../../lib/crud-service");

module.exports = (app) => {
  const Base = createCrudService(app, {
    collection: "user",
    mainKey: "userId",
    idPrefix: "U",
    idLength: 4,
  });

  return class UserService extends Base {
    create(data) {
      const duplicated = this.repo
        .all()
        .some((row) => row.userName === data.userName);
      if (duplicated) {
        const error = new Error("创建失败，用户名已存在");
        error.code = 50000;
        throw error;
      }
      return super.create(data);
    }
  };
};
