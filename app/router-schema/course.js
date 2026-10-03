// 课程域 router-schema：由 crud-schema 按 CRUD 契约生成。
const crudSchema = require("../lib/crud-schema");

module.exports = {
  ...crudSchema({
    basePath: "/api/course/course",
    mainKey: "courseId",
    searchFields: [
      "courseName", "categoryId", "teacherId", "difficulty", "status",
      "price_min", "price_max", "createTime_start", "createTime_end",
    ],
    createBody: { courseName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/courseCategory",
    mainKey: "categoryId",
    searchFields: ["categoryName", "status"],
    createBody: { categoryName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/chapter",
    mainKey: "chapterId",
    searchFields: ["chapterName", "courseId", "freePreview"],
    createBody: { chapterName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/lesson",
    mainKey: "lessonId",
    searchFields: ["lessonName", "chapterId"],
    createBody: { lessonName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/teacher",
    mainKey: "teacherId",
    searchFields: ["teacherName", "status"],
    createBody: { teacherName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/student",
    mainKey: "studentId",
    searchFields: ["nickname", "phone", "source", "createTime_start", "createTime_end"],
    createBody: { nickname: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/course/courseOrder",
    mainKey: "courseOrderId",
    searchFields: [
      "orderNo", "studentName", "payType", "status",
      "createTime_start", "createTime_end",
    ],
  }),
};
