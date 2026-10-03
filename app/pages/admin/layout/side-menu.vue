<template>
  <a-menu
    class="side-menu"
    :selected-keys="[activeKey]"
    :default-open-keys="openKeys"
    :collapsed="store.collapsed"
    auto-scroll-into-view
    @menu-item-click="onSelect"
  >
    <template v-for="item in store.visibleMenu" :key="item.key">
      <a-sub-menu v-if="item.subMenu && item.subMenu.length" :key="item.key">
        <template #title>
          <span class="menu-name">
            <component :is="icons[item.key]" v-if="icons[item.key]" class="menu-icon" />
            {{ item.name }}
          </span>
        </template>
        <a-menu-item v-for="child in item.subMenu" :key="child.key">
          <template #icon>
            <component :is="icons[child.key]" v-if="icons[child.key]" />
          </template>
          {{ child.name }}
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item v-else :key="item.key">
        <template #icon>
          <component :is="icons[item.key]" v-if="icons[item.key]" />
        </template>
        {{ item.name }}
      </a-menu-item>
    </template>
  </a-menu>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminStore, resolveMenuRoute } from "../stores/admin";

const props = defineProps({
  icons: { type: Object, default: () => ({}) },
});

const store = useAdminStore();
const route = useRoute();
const router = useRouter();

// 当前选中项：schema/sider/iframe 路由 → params.key；dashboard → 固定 key
const activeKey = computed(() => {
  if (route.params.key) return String(route.params.key);
  if (route.name === "admin-dashboard") return "dashboard";
  return route.path;
});

// 默认展开全部分组
const openKeys = computed(() =>
  store.visibleMenu.filter((item) => item.subMenu).map((item) => item.key)
);

const onSelect = (key) => {
  const item = store.findMenuItem("key", key);
  if (!item) return;
  const target = resolveMenuRoute(item);
  if (!target) return;
  if (target !== route.path) {
    // 携带 projectKey：/api/project/* 数据接口需要 project_key 请求头，
    // $lumfallCurl 从 window.__LUMFALL__.projectKey 自动注入
    router.push({ path: target, query: { projectKey: store.projectKey } });
  }
};
</script>

<style lang="less" scoped>
.side-menu {
  .menu-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13.5px;
  }

  .menu-icon {
    font-size: 14px;
  }
}
</style>
