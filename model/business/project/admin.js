module.exports = {
  name: "Lumfall Admin",
  desc: "B 端管理台（/view/admin），菜单继承 Model 公共骨架",
  // 管理台 SPA 的入口由 project-list 页特判跳转，不走 /view/dashboard
  homePage: "/dashboard?projectKey=admin&key=dashboard",
  menu: [],
};
