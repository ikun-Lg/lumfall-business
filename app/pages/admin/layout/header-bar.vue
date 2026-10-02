<template>
  <div class="header-bar">
    <div class="header-left">
      <a-button type="text" size="small" class="collapse-btn" @click="store.toggleCollapsed">
        <template #icon>
          <icon-menu-fold v-if="!store.collapsed" />
          <icon-menu-unfold v-else />
        </template>
      </a-button>
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>管理台</a-breadcrumb-item>
        <a-breadcrumb-item v-if="currentName">{{ currentName }}</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="header-right">
      <a-tooltip :content="store.theme === 'dark' ? '切换亮色' : '切换暗色'">
        <a-button type="text" size="small" class="icon-btn" @click="store.toggleTheme">
          <template #icon>
            <icon-sun-fill v-if="store.theme === 'dark'" />
            <icon-moon-fill v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip content="全屏">
        <a-button type="text" size="small" class="icon-btn" @click="toggleFullscreen">
          <template #icon>
            <icon-fullscreen-exit v-if="isFullscreen" />
            <icon-fullscreen v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-dropdown trigger="click" @select="onUserCommand">
        <div class="user-panel">
          <a-avatar :size="26" class="user-avatar">
            {{ (store.user?.nickname || store.user?.userName || "U").slice(0, 1) }}
          </a-avatar>
          <span class="user-name">{{ store.user?.nickname || store.user?.userName || "未登录" }}</span>
          <icon-down class="user-arrow" />
        </div>
        <template #content>
          <a-doption value="profile">
            <template #icon><icon-user /></template>
            个人中心
          </a-doption>
          <a-doption value="logout">
            <template #icon><icon-export /></template>
            退出登录
          </a-doption>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { useAdminStore } from "../stores/admin";
import { logout } from "../../common/auth";

const store = useAdminStore();
const router = useRouter();
const route = useRoute();

// 面包屑当前项：schema/:key → 菜单名；dashboard → 数据看板；profile → 个人中心
const currentName = computed(() => {
  if (route.name === "admin-profile") return "个人中心";
  if (route.params.key) {
    return store.findMenuItem("key", String(route.params.key))?.name || "";
  }
  if (route.name === "admin-dashboard") {
    return store.findMenuItem("key", "dashboard")?.name || "数据看板";
  }
  return "";
});

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = Boolean(document.fullscreenElement);
};

const onUserCommand = (value) => {
  if (value === "profile") {
    router.push("/view/admin/profile");
  } else if (value === "logout") {
    logout();
    Message.success("已退出登录");
  }
};

onMounted(() => document.addEventListener("fullscreenchange", onFullscreenChange));
onBeforeUnmount(() => document.removeEventListener("fullscreenchange", onFullscreenChange));
</script>

<style lang="less" scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .breadcrumb {
      font-size: 13px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;

    .icon-btn {
      color: var(--color-text-2);
    }

    .user-panel {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: 18px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-fill-2);
      }

      .user-avatar {
        background: linear-gradient(135deg, rgb(var(--primary-6)), rgb(var(--primary-4)));
      }

      .user-name {
        font-size: 13px;
        color: var(--color-text-1);
      }

      .user-arrow {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }
}
</style>
