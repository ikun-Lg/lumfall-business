// 登录态工具 + 带鉴权的请求封装。
// token 双通道：localStorage（本包页面的 request() 自动带 Authorization 头）
// + cookie（框架页面 $lumfallCurl 无法注入请求头，登录时同步写 cookie，
// 同源请求自动携带，见 app/controller/auth.js）。
import $curl from "$lumfallCurl";

const TOKEN_KEY = "lumfall_business_token";
const LOGIN_PAGE = "/view/login";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token, maxAgeSeconds = 43200) {
  localStorage.setItem(TOKEN_KEY, token);
  // 同步写 cookie，框架页面（dashboard/schema-view）依赖它携带登录态
  document.cookie = `lumfall_token=${token}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "lumfall_token=; path=/; max-age=0";
}

export function ensureAuth() {
  if (!getToken()) {
    window.location.href = LOGIN_PAGE;
    return false;
  }
  return true;
}

export function handleUnauthorized() {
  clearToken();
  window.location.href = LOGIN_PAGE;
}

/** 登录：成功后自动保存 token（localStorage + cookie） */
export async function login({ username, password }) {
  const res = await $curl({
    method: "post",
    url: "/api/auth/login",
    data: { username, password },
    errorMessage: "登录失败",
  });

  if (res && res.success && res.data?.token) {
    setToken(res.data.token, res.data.maxAgeSeconds);
  }
  return res;
}

export function logout() {
  clearToken();
  window.location.href = LOGIN_PAGE;
}

/**
 * 带鉴权的请求封装：自动注入 Authorization 头，401 统一跳登录页。
 * 用法与 $lumfallCurl 完全一致（透传全部参数）。
 */
export function request(options = {}) {
  return $curl({
    ...options,
    headers: { Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  }).then((res) => {
    if (res && res.success === false && res.code === 401) {
      handleUnauthorized();
    }
    return res;
  });
}
