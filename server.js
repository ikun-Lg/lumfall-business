const { serviceStart } = require("lumfall");

const app = serviceStart({
  // 应用名：渲染页面模板 <title> 时使用
  name: "lumfall-business",

  // 未命中任何路由时的 302 兜底目标。传了 options 对象必须显式声明 homePath
  homePath: "/view/login",
});

module.exports = app;
