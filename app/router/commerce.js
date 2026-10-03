// 电商域路由：全部走 CRUD 契约（GET <api>/list、GET/POST/PUT/PATCH/DELETE <api>、GET <api>Enum/list）。
const registerCrudRoutes = require("../lib/register-crud");

module.exports = (app, router) => {
  const { commerce } = app.controllers;

  // [controller, api 基址, 枚举选项路径（dynamicSelect 数据源，无则不注册）]
  const crudApis = [
    ["product", "/api/project/product", null],
    ["category", "/api/project/category", "/api/project/categoryEnum/list"],
    ["order", "/api/project/order", null],
    ["refund", "/api/project/refund", null],
    ["customer", "/api/project/customer", null],
    ["user", "/api/project/user", null],
    ["coupon", "/api/project/coupon", null],
    ["banner", "/api/project/banner", null],
  ];

  for (const [name, basePath, enumPath] of crudApis) {
    registerCrudRoutes(router, commerce[name], { basePath, enumPath });
  }
};
