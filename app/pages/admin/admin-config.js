/**
 * 管理台配置。换站点名 / 项目 / 菜单图标只改这个文件。
 */

// Dashboard DSL 的项目 key（model/business/project/admin.js），
// 管理台启动时通过 /api/project?projectKey=<key> 拉取合并后的菜单
export const PROJECT_KEY = "admin";

export const SITE_NAME = "Lumfall Admin";

// DSL custom 模块路径 → 管理台前端路由
export const CUSTOM_ROUTES = {
  "/dashboard": "/view/admin/dashboard",
};

// 菜单图标（Arco 图标组件名，全局已注册；未配置的菜单不显示图标）
export const MENU_ICONS = {
  dashboard: "IconDashboard",
  product: "IconStorage",
  user: "IconUserGroup",
};
