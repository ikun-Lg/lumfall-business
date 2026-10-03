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
        <a-breadcrumb-item>{{ store.currentSystem?.name || "管理台" }}</a-breadcrumb-item>
        <a-breadcrumb-item v-for="(name, index) in breadcrumbNames" :key="index">
          {{ name }}
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 系统切换（DSL Model 维度）：一个管理台承载电商 / 课程两套系统 -->
      <a-dropdown trigger="click" @select="onSystemSelect">
        <div class="system-panel">
          <icon-apps class="system-icon" />
          <span class="system-name">{{ store.currentSystem?.name || "选择系统" }}</span>
          <icon-down class="system-arrow" />
        </div>
        <template #content>
          <a-doption
            v-for="system in store.adminSystems"
            :key="system.projectKey"
            :value="system.projectKey"
            :class="{ 'system-active': system.projectKey === store.projectKey }"
          >
            <template #icon>
              <icon-check-circle-fill v-if="system.projectKey === store.projectKey" />
            </template>
            {{ system.name }}
          </a-doption>
        </template>
      </a-dropdown>

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

// 面包屑：当前路由对应菜单的完整路径链（组 → 页面），sider 再带一层子项名
const breadcrumbNames = computed(() => {
  if (route.name === "admin-profile") return ["个人中心"];

  let key = "";
  if (route.name === "admin-dashboard") key = "dashboard";
  if (route.name === "admin-schema" || route.name === "admin-sider" || route.name === "admin-iframe") {
    key = String(route.params.key || "");
  }
  if (!key) return [];

  const path = store.findMenuPath(key) || [];
  let names = path.map((item) => item.name);

  // sider 视图：追加当前子菜单名
  if (route.name === "admin-sider" && route.query.siderKey) {
    const path2 = store.findMenuPath(String(route.query.siderKey)) || [];
    if (path2.length > 0) names.push(path2[path2.length - 1].name);
  }
  // 顶层菜单本身也要展示；组内子项则跳过第一层分组名
  names = names.length > 1 ? names.slice(1) : names;
  return names;
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

// 切换系统：重载菜单并落到该系统第一个可访问页面
const onSystemSelect = async (projectKey) => {
  if (projectKey === store.projectKey) return;
  await store.switchSystem(projectKey);
  const first = store.firstMenuRoute();
  if (first) {
    router.push({ path: first, query: { projectKey } });
    Message.success(`已切换到 ${store.currentSystem?.name}`);
  }
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

    .system-panel {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-right: 8px;
      padding: 4px 10px;
      border-radius: 18px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-fill-2);
      }

      .system-icon {
        color: rgb(var(--primary-6));
      }

      .system-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1);
      }

      .system-arrow {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }

    .system-active {
      color: rgb(var(--primary-6));
      background-color: var(--color-primary-light-1);
    }

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
