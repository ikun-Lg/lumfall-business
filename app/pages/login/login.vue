<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-title">Lumfall Business</span>
        <span class="brand-sub">B 端管理台模板</span>
      </div>

      <a-form :model="form" layout="vertical" @submit-success="handleLogin">
        <a-form-item
          field="username"
          label="账号"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <a-input v-model="form.username" placeholder="请输入账号" allow-clear />
        </a-form-item>
        <a-form-item
          field="password"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          long
          size="large"
          :loading="loading"
        >
          登 录
        </a-button>
      </a-form>

      <div class="hint">
        <icon-info-circle />
        模板默认账号 admin / 123456（见 app/service/auth.js）
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { login, getToken } from "../common/auth.js";

const form = reactive({ username: "", password: "" });
const loading = ref(false);

// 已登录直接进管理台
if (getToken()) {
  window.location.href = "/view/project-list";
}

async function handleLogin() {
  loading.value = true;
  const res = await login(form);
  loading.value = false;

  if (res && res.success) {
    Message.success("登录成功");
    window.location.href = "/view/project-list";
  }
  // 失败时 $lumfallCurl 已按 code 弹出错误提示（如「账号或密码错误」）
}
</script>

<style lang="less" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(160deg, var(--color-fill-2), var(--color-bg-1));

  .login-card {
    width: 380px;
    padding: 36px 32px 28px;
    background-color: var(--color-bg-2);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .brand {
      margin-bottom: 28px;
      text-align: center;

      .brand-title {
        display: block;
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-1);
      }

      .brand-sub {
        display: block;
        margin-top: 6px;
        font-size: 13px;
        color: var(--color-text-3);
      }
    }

    .hint {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 16px;
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}
</style>
