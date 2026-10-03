// 电商系统的管理台项目：菜单完全继承 Model 公共骨架（menu: []），
// 管理台 SPA 通过 /api/project?projectKey=admin 拉取合并后的电商菜单。
module.exports = {
  name: "Lumfall Admin · 电商",
  desc: "电商系统管理台（/view/admin），含商品 / 订单 / 会员 / 营销全流程与数据统计",
  homePage: "/dashboard?projectKey=admin&key=dashboard",
  menu: [],
};
