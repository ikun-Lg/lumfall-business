// 管理台全局状态：当前用户、DSL 菜单、折叠态、主题。
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const THEME_KEY = "lumfall_admin_theme";

function applyThemeAttribute(mode) {
  if (mode === "dark") {
    document.body.setAttribute("arco-theme", "dark");
  } else {
    document.body.removeAttribute("arco-theme");
  }
}

/** boot 之前调用（不依赖 pinia 实例）：按 localStorage / 系统偏好应用主题，避免首屏闪白 */
export function initAdminTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (e) {
    // 忽略隐私模式下 localStorage 不可用
  }
  if (saved === "dark") {
    applyThemeAttribute("dark");
    return;
  }
  if (saved !== "light" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    applyThemeAttribute("dark");
  }
}

/** 按 DSL 菜单项的 moduleType 解析出管理台前端路由（无法解析返回空串） */
export function resolveMenuRoute(item, customRoutes) {
  if (item.moduleType === "schema") {
    return `/view/admin/schema/${item.key}`;
  }
  if (item.moduleType === "custom") {
    return customRoutes[item.customConfig?.path] || "";
  }
  return "";
}

export const useAdminStore = defineStore("admin", () => {
  const user = ref(null); // { userId, userName, nickname, role }
  const menuList = ref([]); // /api/project 返回的合并菜单（DSL）
  const collapsed = ref(false);
  const theme = ref(localStorage.getItem(THEME_KEY) || "light");

  function setUser(info) {
    user.value = info;
  }

  function setMenuList(list) {
    menuList.value = list || [];
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  /** DSL 菜单的 roles 字段：配置了且不包含当前角色 → 不可见（RBAC） */
  function isAllowed(item) {
    const role = user.value?.role;
    if (!item.roles || !item.roles.length) return true;
    return role ? item.roles.includes(role) : false;
  }

  /** 按当前用户角色过滤后的可见菜单（含 subMenu 递归） */
  const visibleMenu = computed(() => {
    const filter = (list) =>
      (list || [])
        .filter((item) => isAllowed(item))
        .map((item) =>
          item.subMenu ? { ...item, subMenu: filter(item.subMenu) } : item
        )
        .filter((item) => !item.subMenu || item.subMenu.length > 0);
    return filter(menuList.value);
  });

  /** 递归查找菜单项 */
  function findMenuItem(key, value, list = menuList.value) {
    for (const item of list || []) {
      if (item[key] === value) return item;
      if (item.subMenu) {
        const found = findMenuItem(key, value, item.subMenu);
        if (found) return found;
      }
    }
    return null;
  }

  /** 第一个可跳转的菜单路由（进入管理台时的落点） */
  function firstMenuRoute(customRoutes) {
    const walk = (list) => {
      for (const item of list) {
        if (item.subMenu) {
          const child = walk(item.subMenu);
          if (child) return child;
          continue;
        }
        const route = resolveMenuRoute(item, customRoutes);
        if (route) return route;
      }
      return null;
    };
    return walk(visibleMenu.value);
  }

  function applyTheme(mode) {
    theme.value = mode;
    localStorage.setItem(THEME_KEY, mode);
    applyThemeAttribute(mode);
  }

  function toggleTheme() {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  }

  return {
    user,
    menuList,
    collapsed,
    theme,
    visibleMenu,
    setUser,
    setMenuList,
    toggleCollapsed,
    findMenuItem,
    firstMenuRoute,
    toggleTheme,
  };
});
