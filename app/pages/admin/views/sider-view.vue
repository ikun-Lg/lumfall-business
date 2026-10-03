<template>
  <div class="sider-view">
    <!-- 左：sider 子菜单 -->
    <div class="sider-menu">
      <a-menu :selected-keys="[activeChildKey]" @menu-item-click="onSelectChild">
        <a-menu-item v-for="child in children" :key="child.key">
          <template #icon>
            <component :is="icons[child.key]" v-if="icons[child.key]" />
          </template>
          {{ child.name }}
        </a-menu-item>
      </a-menu>
    </div>

    <!-- 右：子项内容（schema 页 / 领域分析视图 / iframe） -->
    <div class="sider-content">
      <SchemaPage
        v-if="activeChild?.moduleType === 'schema'"
        :key="activeChild.key"
        :menu-item="activeChild"
      />
      <AnalysisView
        v-else-if="activeCustomDomain"
        :domain="activeCustomDomain"
      />
      <iframe
        v-else-if="activeChild?.moduleType === 'iframe' && iframeSrc"
        :src="iframeSrc"
        class="sider-iframe"
      />
      <div v-else class="sider-empty">
        <a-empty description="该子项暂不支持在侧边栏视图中展示" />
      </div>
    </div>
  </div>
</template>

<script setup>
// sider 复合视图（DSL moduleType: "sider"）：左侧子菜单 + 右侧内容区。
// 与框架 dashboard 的 sider-view 同构：子菜单选中态走路由 query.siderKey（深链接可用），
// 内容区按子项 moduleType 分发——schema 子项内嵌通用 schema 页，
// custom 子项按 admin-config 的映射渲染领域视图，iframe 子项内嵌页面。
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SchemaPage from "./schema-page.vue";
import AnalysisView from "./analysis-view.vue";
import { useAdminStore } from "../stores/admin";
import { MENU_ICONS, SIDER_CUSTOM_DOMAINS } from "../admin-config";

const route = useRoute();
const router = useRouter();
const store = useAdminStore();

const icons = MENU_ICONS;

const menuItem = computed(() =>
  store.findMenuItem("key", String(route.params.key))
);

const children = computed(() => {
  const list = menuItem.value?.siderConfig?.menu || [];
  // RBAC：sider 子菜单同样按角色过滤
  return list.filter((item) => {
    if (!item.roles?.length) return true;
    const role = store.user?.role;
    return role ? item.roles.includes(role) : false;
  });
});

const activeChildKey = computed(() => {
  const fromQuery = String(route.query.siderKey || "");
  if (fromQuery && children.value.some((child) => child.key === fromQuery)) {
    return fromQuery;
  }
  return children.value[0]?.key || "";
});

const activeChild = computed(() =>
  children.value.find((child) => child.key === activeChildKey.value) || null
);

// custom 子项 → 领域视图（analysis 页按 domain 参数取数）
const activeCustomDomain = computed(() => {
  if (activeChild.value?.moduleType !== "custom") return "";
  return SIDER_CUSTOM_DOMAINS[activeChild.value?.customConfig?.path] || "";
});

const iframeSrc = computed(() => {
  const path = activeChild.value?.iframeConfig?.path;
  if (!path) return "";
  return path;
});

const onSelectChild = (key) => {
  if (key === activeChildKey.value) return;
  // siderKey 进 query：刷新 / 深链接后选中态不丢
  router.replace({
    path: route.path,
    query: { ...route.query, siderKey: key },
  });
};
</script>

<style lang="less" scoped>
.sider-view {
  display: flex;
  gap: 16px;
  align-items: stretch;
  height: 100%;

  .sider-menu {
    flex: 0 0 200px;
    padding: 8px;
    background-color: var(--color-bg-2);
    border-radius: 10px;
    align-self: flex-start;
  }

  .sider-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }

  .sider-iframe {
    width: 100%;
    height: calc(100vh - 140px);
    border: none;
    border-radius: 10px;
    background-color: var(--color-bg-2);
  }

  .sider-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    background-color: var(--color-bg-2);
    border-radius: 10px;
  }
}
</style>
