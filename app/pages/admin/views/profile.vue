<template>
  <div class="profile-page">
    <a-row :gutter="16">
      <!-- 用户卡片 -->
      <a-col :xs="24" :md="8">
        <div class="panel user-card">
          <a-avatar :size="72" class="user-avatar">
            {{ (store.user?.nickname || store.user?.userName || "U").slice(0, 1) }}
          </a-avatar>
          <div class="user-name">{{ store.user?.nickname }}</div>
          <div class="user-account">@{{ store.user?.userName }}</div>
          <a-tag :color="store.user?.role === 'admin' ? 'orangered' : 'arcoblue'" size="small">
            {{ store.user?.role === "admin" ? "管理员" : "普通用户" }}
          </a-tag>
          <div class="user-id">ID：{{ store.user?.userId }}</div>
        </div>
      </a-col>

      <!-- 表单区 -->
      <a-col :xs="24" :md="16">
        <div class="panel">
          <div class="panel-title">基本资料</div>
          <a-form :model="profileForm" layout="vertical" @submit-success="saveProfile">
            <a-form-item field="nickname" label="昵称" :rules="[{ required: true, message: '请输入昵称' }]">
              <a-input v-model="profileForm.nickname" :max-length="32" allow-clear />
            </a-form-item>
            <a-button type="primary" html-type="submit" :loading="savingProfile">保存修改</a-button>
          </a-form>
        </div>

        <div class="panel">
          <div class="panel-title">修改密码</div>
          <a-form ref="pwdFormRef" :model="pwdForm" layout="vertical" @submit-success="savePassword">
            <a-form-item field="oldPassword" label="原密码" :rules="[{ required: true, message: '请输入原密码' }]">
              <a-input-password v-model="pwdForm.oldPassword" />
            </a-form-item>
            <a-form-item
              field="newPassword"
              label="新密码"
              :rules="[
                { required: true, message: '请输入新密码' },
                { minLength: 6, message: '至少 6 位' },
              ]"
            >
              <a-input-password v-model="pwdForm.newPassword" />
            </a-form-item>
            <a-form-item
              field="confirmPassword"
              label="确认新密码"
              :rules="[
                { required: true, message: '请再次输入新密码' },
                { validator: validateConfirm, message: '两次输入不一致' },
              ]"
            >
              <a-input-password v-model="pwdForm.confirmPassword" />
            </a-form-item>
            <a-button type="primary" html-type="submit" :loading="savingPwd">更新密码</a-button>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { useAdminStore } from "../stores/admin";
import { request } from "../../common/auth";

const store = useAdminStore();

// 基本资料
const profileForm = reactive({ nickname: store.user?.nickname || "" });
const savingProfile = ref(false);

const saveProfile = async () => {
  savingProfile.value = true;
  const res = await request({
    method: "post",
    url: "/api/auth/update_profile",
    data: { nickname: profileForm.nickname },
  });
  savingProfile.value = false;

  if (res?.success) {
    Message.success("资料已更新");
    store.setUser(res.data);
  }
};

// 修改密码
const pwdFormRef = ref(null);
const pwdForm = reactive({ oldPassword: "", newPassword: "", confirmPassword: "" });
const savingPwd = ref(false);

const validateConfirm = (value, callback) => {
  if (value !== pwdForm.newPassword) {
    return callback("两次输入不一致");
  }
  return callback();
};

const savePassword = async () => {
  savingPwd.value = true;
  const res = await request({
    method: "post",
    url: "/api/auth/change_password",
    data: { oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword },
  });
  savingPwd.value = false;

  if (res?.success) {
    Message.success("密码已更新，下次登录请使用新密码");
    pwdFormRef.value?.resetFields();
  }
};
</script>

<style lang="less" scoped>
.profile-page {
  .panel {
    padding: 20px;
    background-color: var(--color-bg-2);
    border-radius: 10px;

    & + .panel {
      margin-top: 16px;
    }

    .panel-title {
      margin-bottom: 16px;
      font-size: 14.5px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }

  .user-card {
    text-align: center;

    .user-avatar {
      background: linear-gradient(135deg, rgb(var(--primary-6)), rgb(var(--primary-4)));
      font-size: 26px;
    }

    .user-name {
      margin-top: 12px;
      font-size: 17px;
      font-weight: 700;
      color: var(--color-text-1);
    }

    .user-account {
      margin: 4px 0 10px;
      font-size: 12.5px;
      color: var(--color-text-3);
    }

    .user-id {
      margin-top: 12px;
      font-size: 12px;
      color: var(--color-text-3);
    }
  }
}
</style>
