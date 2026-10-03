<template>
  <div class="iframe-view">
    <iframe v-if="iframeSrc" :src="iframeSrc" class="iframe-frame" />
    <div v-else class="iframe-empty">
      <a-empty description="该菜单未配置 iframe 地址" />
    </div>
  </div>
</template>

<script setup>
// iframe 嵌入视图（DSL moduleType: "iframe"）：
// path 为完整 URL 时嵌入外部页面；为内部绝对路径（如 /view/health）时嵌入站内页面。
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "../stores/admin";

const route = useRoute();
const store = useAdminStore();

const menuItem = computed(() =>
  store.findMenuItem("key", String(route.params.key))
);

const iframeSrc = computed(() => menuItem.value?.iframeConfig?.path || "");
</script>

<style lang="less" scoped>
.iframe-view {
  height: 100%;

  .iframe-frame {
    width: 100%;
    height: calc(100vh - 140px);
    border: none;
    border-radius: 10px;
    background-color: var(--color-bg-2);
  }

  .iframe-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    background-color: var(--color-bg-2);
    border-radius: 10px;
  }
}
</style>
