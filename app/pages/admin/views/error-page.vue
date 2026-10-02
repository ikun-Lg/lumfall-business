<template>
  <div class="error-page">
    <a-result :status="String(code)" :subtitle="subtitle">
      <template #extra>
        <a-button type="primary" @click="$router.push('/view/admin')">返回管理台</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const code = route.meta.code || 404;
const subtitle = computed(
  () => `抱歉，页面${code === 404 ? "不存在" : "走丢了"}`
);
</script>

<style lang="less" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-fill-2);
}
</style>
