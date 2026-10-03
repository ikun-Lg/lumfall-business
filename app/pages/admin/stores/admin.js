// 管理台全局状态：当前系统（DSL Model）、当前用户、菜单、折叠态、主题。
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  ADMIN_PROJECTS,
  DEFAULT_PROJECT_KEY,
  API_DOMAINS,
  CUSTOM_ROUTES,
} from "../admin-config";
import { request } from "../../common/auth";

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

/**
 * 按 DSL 菜单项的 moduleType 解析出管理台前端路由（无法解析返回空串）。
 * 管理台是 DSL 全形态消费端：schema / custom / sider / iframe 四种模块全部可路由。
 */
export function resolveMenuRoute(item) {
  const key = item.key;
  if (item.moduleType === "schema") {
    return `/view/admin/schema/${key}`;
  }
  if (item.moduleType === "custom") {
    return CUSTOM_ROUTES[item.customConfig?.path] || "";
  }
  if (item.moduleType === "sider") {
    return `/view/admin/sider/${key}`;
  }
  if (item.moduleType === "iframe") {
    return `/view/admin/iframe/${key}`;
  }
  return "";
}

export const useAdminStore = defineStore("admin", () => {
  const user = ref(null); // { userId, userName, nickname, role }
  const modelList = ref([]); // /api/project/model_list 返回的 Model 列表
  const projectKey = ref(DEFAULT_PROJECT_KEY); // 当前系统的管理台 Project key
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

  // ── 系统切换（DSL Model 维度）──

  /** 可切换的系统列表：modelList 里映射了管理台项目的 Model */
  const adminSystems = computed(() =>
    modelList.value
      .filter((model) => ADMIN_PROJECTS[model.model?.key])
      .map((model) => ({
        modelKey: model.model.key,
        name: model.model.name,
        projectKey: ADMIN_PROJECTS[model.model.key],
      }))
  );

  const currentSystem = computed(() =>
    adminSystems.value.find((system) => system.projectKey === projectKey.value) || null
  );

  /** 当前系统的统计口径（dashboard / analysis 接口的 domain 参数） */
  const domain = computed(
    () => API_DOMAINS[currentSystem.value?.modelKey] || "commerce"
  );

  /** 拉取 Model 列表（model_list 接口免 project_key） */
  async function loadModelList() {
    const res = await request({
      method: "get",
      url: "/api/project/model_list",
    });
    if (res?.success) {
      modelList.value = res.data || [];
    }
  }

  /** 切换系统：按 Project key 拉取合并后的菜单 */
  async function switchSystem(key) {
    projectKey.value = key;
    const res = await request({
      method: "get",
      url: "/api/project",
      query: { projectKey: key },
      headers: { project_key: key },
    });
    if (res?.success) {
      setMenuList(res.data?.menu || []);
    }
  }

  /** DSL 菜单的 roles 字段：配置了且不包含当前角色 → 不可见（RBAC） */
  function isAllowed(item) {
    const role = user.value?.role;
    if (!item.roles || !item.roles.length) return true;
    return role ? item.roles.includes(role) : false;
  }

  /** 按当前用户角色过滤后的可见菜单（含 subMenu / siderConfig.menu 递归） */
  const visibleMenu = computed(() => {
    const filter = (list) =>
      (list || [])
        .filter((item) => isAllowed(item))
        .map((item) => {
          const next = { ...item };
          if (item.subMenu) next.subMenu = filter(item.subMenu);
          if (item.siderConfig?.menu) {
            next.siderConfig = {
              ...item.siderConfig,
              menu: filter(item.siderConfig.menu),
            };
          }
          return next;
        })
        .filter(
          (item) =>
            (!item.subMenu || item.subMenu.length > 0) &&
            (!item.siderConfig?.menu || item.siderConfig.menu.length > 0)
        );
    return filter(menuList.value);
  });

  /** 递归查找菜单项（含 sider 子菜单） */
  function findMenuItem(key, value, list = menuList.value) {
    for (const item of list || []) {
      if (item[key] === value) return item;
      if (item.subMenu) {
        const found = findMenuItem(key, value, item.subMenu);
        if (found) return found;
      }
      if (item.siderConfig?.menu) {
        const found = findMenuItem(key, value, item.siderConfig.menu);
        if (found) return found;
      }
    }
    return null;
  }

  /** 菜单路径链（面包屑用）：返回从顶层到目标的数组 */
  function findMenuPath(value, list = menuList.value, trail = []) {
    for (const item of list || []) {
      const next = [...trail, item];
      if (item.key === value) return next;
      if (item.subMenu) {
        const found = findMenuPath(value, item.subMenu, next);
        if (found) return found;
      }
      if (item.siderConfig?.menu) {
        const found = findMenuPath(value, item.siderConfig.menu, next);
        if (found) return found;
      }
    }
    return null;
  }

  /** 第一个可跳转的菜单路由（进入管理台 / 切换系统时的落点） */
  function firstMenuRoute() {
    const walk = (list) => {
      for (const item of list) {
        if (item.subMenu) {
          const child = walk(item.subMenu);
          if (child) return child;
          continue;
        }
        const route = resolveMenuRoute(item);
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
    modelList,
    projectKey,
    menuList,
    collapsed,
    theme,
    adminSystems,
    currentSystem,
    domain,
    visibleMenu,
    setUser,
    setMenuList,
    toggleCollapsed,
    loadModelList,
    switchSystem,
    findMenuItem,
    findMenuPath,
    firstMenuRoute,
    toggleTheme,
  };
});
