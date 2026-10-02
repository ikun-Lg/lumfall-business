<template>
  <a-layout class="admin-layout">
    <a-layout-sider
      class="layout-sider"
      :collapsed="store.collapsed"
      :width="224"
      :collapsed-width="60"
      collapse-position="right"
      hide-trigger
    >
      <div class="brand" @click="goHome">
        <div class="brand-logo">L</div>
        <span v-if="!store.collapsed" class="brand-name">{{ siteName }}</span>
      </div>
      <SideMenu :icons="menuIcons" :custom-routes="customRoutes" />
    </a-layout-sider>

    <a-layout class="layout-main">
      <a-layout-header class="layout-header">
        <HeaderBar />
      </a-layout-header>
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SideMenu from "./side-menu.vue";
import HeaderBar from "./header-bar.vue";
import { useAdminStore } from "../stores/admin";
import {
  PROJECT_KEY,
  SITE_NAME,
  MENU_ICONS,
  CUSTOM_ROUTES,
} from "../admin-config";
import { ensureAuth, request, handleUnauthorized } from "../../common/auth";

const store = useAdminStore();
const route = useRoute();
const router = useRouter();
const siteName = SITE_NAME;
const menuIcons = MENU_ICONS;
const customRoutes = CUSTOM_ROUTES;

const goHome = () => router.push("/view/admin");

onMounted(async () => {
  // 登录守卫：无 token 跳登录页
  if (!ensureAuth()) return;

  // 当前用户（401 由 request 封装统一跳登录）
  const userRes = await request({ method: "get", url: "/api/auth/current_user" });
  if (!userRes || !userRes.success) {
    if (userRes && userRes.code === 401) handleUnauthorized();
    return;
  }
  store.setUser(userRes.data);

  // 菜单来自 Dashboard DSL（/api/project 返回合并后的项目菜单）
  const menuRes = await request({
    method: "get",
    url: "/api/project",
    query: { projectKey: PROJECT_KEY },
    headers: { project_key: PROJECT_KEY },
  });
  if (menuRes && menuRes.success) {
    store.setMenuList(menuRes.data?.menu || []);
  }

  // 深链接兜底：管理台路由统一携带 projectKey（$lumfallCurl 依赖它注入请求头）
  if (route.path.startsWith("/view/admin") && route.query.projectKey !== PROJECT_KEY) {
    router.replace({ path: route.path, query: { ...route.query, projectKey: PROJECT_KEY } });
    return;
  }

  // /view/admin 根路径 → 第一个可见菜单
  if (route.path === "/view/admin") {
    const first = store.firstMenuRoute(CUSTOM_ROUTES);
    if (first) router.replace({ path: first, query: { projectKey: PROJECT_KEY } });
  }
});
</script>

<style lang="less" scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;

  .layout-sider {
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-2);
    border-right: 1px solid var(--color-border-2);

    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      height: 56px;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;

      .brand-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgb(var(--primary-6)), rgb(var(--primary-4)));
        color: #fff;
        font-weight: 800;
        font-size: 16px;
      }

      .brand-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-text-1);
      }
    }

    :deep(.arco-layout-sider-children) {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    :deep(.arco-menu) {
      flex: 1;
      overflow-y: auto;
      background: transparent;
    }
  }

  .layout-header {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 16px;
    background-color: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border-2);
  }

  .layout-content {
    padding: 16px;
    overflow-y: auto;
    background-color: var(--color-fill-2);
  }
}
</style>
