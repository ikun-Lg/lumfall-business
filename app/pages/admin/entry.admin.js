import boot from "$lumfallBoot";
import Admin from "./admin.vue";
import { initAdminTheme } from "./stores/admin";
import { DEFAULT_PROJECT_KEY } from "./admin-config";

// 管理台的数据接口多在 /api/project/* 下，`$lumfallCurl` 依据
// window.__LUMFALL__.projectKey 自动注入 project_key 请求头；该值由服务端
// 渲染模板时从 URL 注入，SPA 内路由变化不会更新——入口处固定为默认系统，
// 深链接 / 刷新 / 站内跳转全部生效（project_key 只要求存在，不校验值）
window.__LUMFALL__ = { ...(window.__LUMFALL__ || {}), projectKey: DEFAULT_PROJECT_KEY };

// 提前应用主题，避免首屏闪白
initAdminTheme();

// 管理台 SPA：/view/admin 为布局根，业务页面是其子路由。
// 菜单不写死在前端——由 Dashboard DSL 驱动（顶部可切换电商 / 课程系统，
// 菜单经 /api/project?projectKey=<当前系统> 拉取）：
//   schema 模块 → /view/admin/schema/:key 通用 CRUD 页
//   sider 模块  → /view/admin/sider/:key 侧边栏复合视图
//   iframe 模块 → /view/admin/iframe/:key 嵌入页
//   custom 模块 → admin-config 的 CUSTOM_ROUTES 映射
boot(Admin, {
  routes: [
    {
      path: "/view/admin",
      component: () => import("./layout/admin-layout.vue"),
      children: [
        { path: "", redirect: "/view/admin/dashboard" },
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("./views/dashboard.vue"),
        },
        {
          path: "schema/:key",
          name: "admin-schema",
          component: () => import("./views/schema-page.vue"),
        },
        {
          path: "sider/:key",
          name: "admin-sider",
          component: () => import("./views/sider-view.vue"),
        },
        {
          path: "iframe/:key",
          name: "admin-iframe",
          component: () => import("./views/iframe-view.vue"),
        },
        {
          path: "profile",
          name: "admin-profile",
          component: () => import("./views/profile.vue"),
        },
      ],
    },
    {
      path: "/view/admin/:pathMatch(.*)",
      component: () => import("./views/error-page.vue"),
      meta: { code: 404 },
    },
  ],
});
