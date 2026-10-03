// 课程系统的管理台项目：菜单完全继承 Model 公共骨架（menu: []），
// 管理台 SPA 通过 /api/project?projectKey=edu-admin 拉取合并后的课程菜单。
module.exports = {
  name: "Lumfall Admin · 课程",
  desc: "课程系统管理台（/view/admin），含课程 / 章节 / 课时 / 讲师 / 学员 / 订单全流程",
  homePage: "/dashboard?projectKey=edu-admin&key=dashboard",
  menu: [],
};
