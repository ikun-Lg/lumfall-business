<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import zhCN from "@arco-design/web-vue/es/locale/lang/zh-cn";
</script>

<style lang="less">
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
</style>
