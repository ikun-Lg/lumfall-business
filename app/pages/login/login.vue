<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <div class="login-card">
      <div class="brand">
        <div class="brand-logo">L</div>
        <div>
          <div class="brand-title">Lumfall Business</div>
          <div class="brand-sub">B 端全栈管理台模板</div>
        </div>
      </div>

      <a-form :model="form" layout="vertical" @submit-success="handleLogin">
        <a-form-item
          field="username"
          label="账号"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <a-input v-model="form.username" placeholder="请输入账号" size="large" allow-clear>
            <template #prefix><icon-user /></template>
          </a-input>
        </a-form-item>
        <a-form-item
          field="password"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model="form.password" placeholder="请输入密码" size="large">
            <template #prefix><icon-lock /></template>
          </a-input-password>
        </a-form-item>

        <a-button
          type="primary"
          html-type="submit"
          long
          size="large"
          :loading="loading"
          class="submit-btn"
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

// 已登录直接进项目工作台
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(150deg, #e8f3ff 0%, #f5f8ff 45%, #e6fffb 100%);

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.55;

    &.shape-1 {
      width: 420px;
      height: 420px;
      top: -120px;
      right: -80px;
      background: rgba(22, 93, 255, 0.35);
    }

    &.shape-2 {
      width: 360px;
      height: 360px;
      bottom: -140px;
      left: -60px;
      background: rgba(20, 201, 201, 0.32);
    }

    &.shape-3 {
      width: 220px;
      height: 220px;
      top: 40%;
      left: 12%;
      background: rgba(208, 148, 255, 0.28);
    }
  }

  .login-card {
    position: relative;
    z-index: 1;
    width: 400px;
    padding: 40px 36px 28px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(22, 93, 255, 0.12);

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 30px;

      .brand-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #165dff, #14c9c9);
        color: #fff;
        font-size: 22px;
        font-weight: 800;
      }

      .brand-title {
        font-size: 21px;
        font-weight: 700;
        color: var(--color-text-1);
        line-height: 1.2;
      }

      .brand-sub {
        margin-top: 2px;
        font-size: 12.5px;
        color: var(--color-text-3);
      }
    }

    .submit-btn {
      margin-top: 6px;
      letter-spacing: 4px;
    }

    .hint {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 18px;
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}

// 暗色模式下弱化背景与卡片
body[arco-theme="dark"] .login-page {
  background: linear-gradient(150deg, #0d0e10 0%, #131720 60%, #0d1f1e 100%);

  .login-card {
    background: rgba(23, 24, 28, 0.82);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
}
</style>
