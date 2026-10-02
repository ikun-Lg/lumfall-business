<template>
  <div class="schema-page">
    <!-- 角色无权限（DSL 菜单 roles 配置） -->
    <a-result v-if="forbidden" status="403" subtitle="没有访问该页面的权限">
      <template #extra>
        <a-button type="primary" @click="$router.push('/view/admin')">返回看板</a-button>
      </template>
    </a-result>

    <template v-else-if="menuItem">
      <!-- 搜索 + 表格 -->
      <div class="panel">
        <SchemaSearchBar :schema="searchSchema" @search="onSearch" @reset="onReset" />
      </div>

      <div class="panel">
        <div class="table-header">
          <span class="table-title">{{ menuItem.name }}</span>
          <a-space>
            <a-button
              v-for="btn in headerButtons"
              :key="btn.label"
              :type="btn.type"
              size="small"
              @click="onHeaderButton(btn)"
            >
              {{ btn.label }}
            </a-button>
          </a-space>
        </div>

        <SchemaTable
          :schema="tableSchema"
          :api="api"
          :api-params="apiParams"
          :buttons="rowButtons"
          @operate="onOperate"
        />
      </div>

      <!-- 新增 / 编辑抽屉 -->
      <a-drawer
        v-model:visible="drawerVisible"
        :title="drawerTitle"
        :width="480"
        unmount-on-close
      >
        <SchemaForm ref="formRef" :schema="formSchema" :model="formModel" />
        <template #footer>
          <a-space>
            <a-button @click="drawerVisible = false">取消</a-button>
            <a-button type="primary" :loading="saving" @click="saveForm">保存</a-button>
          </a-space>
        </template>
      </a-drawer>

      <!-- 详情抽屉 -->
      <a-drawer v-model:visible="detailVisible" :title="'详情'" :width="440" unmount-on-close>
        <a-descriptions :column="1" bordered size="medium">
          <a-descriptions-item v-for="row in detailRows" :key="row.label" :label="row.label">
            {{ row.value }}
          </a-descriptions-item>
        </a-descriptions>
      </a-drawer>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Modal, Message } from "@arco-design/web-vue";
import SchemaForm from "$lumfallSchemaForm";
import SchemaSearchBar from "$lumfallSchemaSearchBar";
import SchemaTable from "$lumfallSchemaTable";
import { useAdminStore } from "../stores/admin";
import { request } from "../../common/auth";

/**
 * 通用 schema CRUD 页（自建版 schema-view）：由 Dashboard DSL 的 schemaConfig
 * 驱动——一份字段 schema 按 <视图>Option 拆分进 搜索栏/表格/表单/详情 四个视图，
 * 按钮与动态抽屉来自 tableConfig。与框架 schema-view 同一套机制，UI 为管理台风格。
 */

const route = useRoute();
const store = useAdminStore();

const menuItem = computed(() => store.findMenuItem("key", String(route.params.key)));

// DSL 菜单的 roles RBAC：无权限渲染 403
const forbidden = computed(() => {
  const item = menuItem.value;
  if (!item || !item.roles?.length) return false;
  const role = store.user?.role;
  return !role || !item.roles.includes(role);
});

// buildDtoSchema：与框架 schema-view/hook/schema.js 同一套机制——
// 字段配置了 <viewName>Option 才进入对应视图；顶层 required 自动注入 option.required
function buildDtoSchema(schema, viewName) {
  if (!schema?.properties) {
    return { type: "object", properties: {} };
  }
  const dto = { type: "object", properties: {} };
  for (const key of Object.keys(schema.properties)) {
    const field = schema.properties[key];
    const option = field[`${viewName}Option`];
    if (!option) continue;

    const rest = {};
    for (const k of Object.keys(field)) {
      if (!k.endsWith("Option")) rest[k] = field[k];
    }
    dto.properties[key] = { ...rest, option: { ...option } };
    if (schema.required?.includes(key)) {
      dto.properties[key].option.required = true;
    }
  }
  return dto;
}

const api = computed(() => menuItem.value?.schemaConfig?.api || "");
const schemaConfig = computed(() => menuItem.value?.schemaConfig || {});
const searchSchema = computed(() => buildDtoSchema(schemaConfig.value.schema, "search"));
const tableSchema = computed(() => buildDtoSchema(schemaConfig.value.schema, "table"));
const headerButtons = computed(() => schemaConfig.value.tableConfig?.headerButtons || []);
const rowButtons = computed(() => schemaConfig.value.tableConfig?.rowButtons || []);

// 搜索参数（替换引用触发 SchemaTable 重新加载）
const apiParams = ref({});

const onSearch = (values) => {
  apiParams.value = { ...values };
};
const onReset = () => {
  apiParams.value = {};
};

// ===== 动态抽屉（createForm / editForm / detailPanel） =====
const drawerVisible = ref(false);
const detailVisible = ref(false);
const drawerTitle = ref("");
const drawerType = ref("");
const formRef = ref(null);
const formSchema = ref({ type: "object", properties: {} });
const formModel = ref(null);
const saving = ref(false);
const editingRow = ref(null);
const detailRows = ref([]);

const openCreateForm = () => {
  drawerType.value = "createForm";
  drawerTitle.value = schemaConfig.value.tableConfig?.componentConfig?.createForm?.title || "创建";
  formSchema.value = buildDtoSchema(schemaConfig.value.schema, "createForm");
  formModel.value = null;
  editingRow.value = null;
  drawerVisible.value = true;
};

const openEditForm = (rowData) => {
  const componentConfig = schemaConfig.value.tableConfig?.componentConfig;
  const mainKey = componentConfig?.editForm?.mainKey;
  if (!mainKey) {
    Message.warning("editForm 未配置 mainKey");
    return;
  }
  drawerType.value = "editForm";
  drawerTitle.value = componentConfig?.editForm?.title || "编辑";
  formSchema.value = buildDtoSchema(schemaConfig.value.schema, "editForm");
  editingRow.value = rowData;
  formModel.value = null; // GET 回显后填充
  drawerVisible.value = true;

  // GET <api>?<mainKey>=<值> 回显
  request({ method: "get", url: api.value, query: { [mainKey]: rowData[mainKey] } }).then(
    (res) => {
      if (res?.success) {
        formModel.value = res.data;
      }
    }
  );
};

const openDetailPanel = (rowData) => {
  const componentConfig = schemaConfig.value.tableConfig?.componentConfig;
  const mainKey = componentConfig?.detailPanel?.mainKey;
  detailVisible.value = true;
  detailRows.value = [];

  request({ method: "get", url: api.value, query: { [mainKey]: rowData[mainKey] } }).then(
    (res) => {
      if (!res?.success) return;
      // 字段配置了 detailPanelOption 才展示（枚举翻译为 label）
      const detailSchema = buildDtoSchema(schemaConfig.value.schema, "detailPanel");
      detailRows.value = Object.keys(detailSchema.properties).map((key) => {
        const field = detailSchema.properties[key];
        const enumList = field.option?.enumList;
        const hit = enumList?.find((item) => String(item.value) === String(res.data[key]));
        return { label: field.label, value: hit ? hit.label : res.data[key] };
      });
    }
  );
};

const saveForm = async () => {
  if (!formRef.value?.validate()) return;
  const value = formRef.value.getValue();
  saving.value = true;

  const isEdit = drawerType.value === "editForm";
  const mainKey = schemaConfig.value.tableConfig?.componentConfig?.editForm?.mainKey;
  const res = await request({
    method: isEdit ? "put" : "post",
    url: api.value,
    data: isEdit ? { ...value, [mainKey]: editingRow.value[mainKey] } : value,
  });
  saving.value = false;

  if (res && res.success) {
    Message.success("保存成功");
    drawerVisible.value = false;
    refreshTable();
  }
};

const refreshTable = () => {
  apiParams.value = { ...apiParams.value };
};

const confirmDelete = (btnConfig, rowData) => {
  const [paramKey, paramExpr] = Object.entries(btnConfig.eventOption?.params || {})[0] || [];
  const value = String(paramExpr || "").startsWith("schema::")
    ? rowData[paramExpr.slice("schema::".length)]
    : paramExpr;

  Modal.confirm({
    title: "删除确认",
    content: "删除后不可恢复，确定删除该条数据吗？",
    okButtonProps: { status: "danger" },
    onOk: async () => {
      const res = await request({
        method: "delete",
        url: api.value,
        data: { [paramKey]: value },
      });
      if (res?.success) {
        Message.success("删除成功");
        refreshTable();
      }
    },
  });
};

// ===== 按钮事件分发 =====
const onHeaderButton = (btnConfig) => {
  if (btnConfig.eventKey === "showComponent") {
    if (btnConfig.eventOption?.comName === "createForm") openCreateForm();
    return;
  }
  // 其余 eventKey：业务按需在模板里扩展
};

const onOperate = ({ btnConfig, rowData }) => {
  if (btnConfig.eventKey === "showComponent") {
    const comName = btnConfig.eventOption?.comName;
    if (comName === "editForm") openEditForm(rowData);
    if (comName === "detailPanel") openDetailPanel(rowData);
    if (comName === "createForm") openCreateForm();
    return;
  }
  if (btnConfig.eventKey === "delete") {
    confirmDelete(btnConfig, rowData);
  }
};
</script>

<style lang="less" scoped>
.schema-page {
  .panel {
    padding: 16px;
    background-color: var(--color-bg-2);
    border-radius: 10px;

    & + .panel {
      margin-top: 16px;
    }

    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .table-title {
        font-size: 14.5px;
        font-weight: 600;
        color: var(--color-text-1);
      }
    }
  }
}
</style>
