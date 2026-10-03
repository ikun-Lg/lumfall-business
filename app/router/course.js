// 课程域路由：与电商域同一套 CRUD 契约。
const registerCrudRoutes = require("../lib/register-crud");

module.exports = (app, router) => {
  const { course } = app.controllers;

  const crudApis = [
    ["course", "/api/course/course", "/api/course/courseEnum/list"],
    ["courseCategory", "/api/course/courseCategory", "/api/course/courseCategoryEnum/list"],
    ["chapter", "/api/course/chapter", "/api/course/chapterEnum/list"],
    ["lesson", "/api/course/lesson", null],
    ["teacher", "/api/course/teacher", "/api/course/teacherEnum/list"],
    ["student", "/api/course/student", null],
    ["courseOrder", "/api/course/courseOrder", null],
  ];

  for (const [name, basePath, enumPath] of crudApis) {
    registerCrudRoutes(router, course[name], { basePath, enumPath });
  }
};
