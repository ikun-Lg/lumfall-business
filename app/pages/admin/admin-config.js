/**
 * 管理台配置。换站点名 / 系统项目 / 菜单图标 / 自定义路由映射只改这个文件。
 */

// 一个管理台承载多个业务系统（DSL Model）：modelKey → 该系统管理台 Project 的 key。
// 顶部系统切换器基于这份映射 + /api/project/model_list 渲染。
export const ADMIN_PROJECTS = {
  business: "admin", // 电商系统
  course: "edu-admin", // 课程系统
};

// 默认（首次进入）使用的系统
export const DEFAULT_PROJECT_KEY = ADMIN_PROJECTS.business;

// 当前激活系统（写入 window.__LUMFALL__.projectKey，
// 供 $lumfallCurl 对 /api/project/* 请求注入 project_key 头）
export const SITE_NAME = "Lumfall Admin";

// DSL Model key → 统计接口的 domain 口径（/api/dashboard/* 查询参数）
export const API_DOMAINS = {
  business: "commerce",
  course: "course",
};

// DSL custom 模块路径 → 管理台前端路由
export const CUSTOM_ROUTES = {
  "/dashboard": "/view/admin/dashboard",
};

// sider 子菜单 custom 路径 → 页内渲染的领域视图
// （sider 视图内不跳走，由 sider-view 按 domain 渲染 analysis 组件）
export const SIDER_CUSTOM_DOMAINS = {
  "/commerce/analysis": "commerce",
  "/course/analysis": "course",
};

// 菜单图标（Arco 图标组件名，全局已注册；未配置的菜单不显示图标）
export const MENU_ICONS = {
  dashboard: "IconDashboard",
  "product-group": "IconApps",
  product: "IconStorage",
  category: "IconTag",
  "order-group": "IconList",
  order: "IconFile",
  refund: "IconUndo",
  "customer-group": "IconUserGroup",
  customer: "IconUser",
  user: "IconIdcard",
  "marketing-group": "IconFire",
  coupon: "IconGift",
  banner: "IconImage",
  stats: "IconBarChart",
  "course-group": "IconApps",
  course: "IconBook",
  chapter: "IconBookmark",
  courseCategory: "IconTag",
  "learn-group": "IconCommon",
  lesson: "IconPlayCircle",
  teacher: "IconUserAdd",
  student: "IconSearch",
  courseOrder: "IconFile",
};
