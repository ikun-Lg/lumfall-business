<template>
  <div class="schema-page">
    <!-- 角色无权限（DSL 菜单 roles 配置） -->
    <a-result v-if="forbidden" status="403" subtitle="没有访问该页面的权限">
      <template #extra>
        <a-button type="primary" @click="$router.push('/view/admin')">返回看板</a-button>
      </template>
    </a-result>

    <template v-else-if="resolvedMenuItem">
      <!-- 搜索 + 表格 -->
      <div class="panel">
        <SchemaSearchBar :schema="searchSchema" @search="onSearch" @reset="onReset" />
      </div>

      <div class="panel">
        <div class="table-header">
          <a-space>
            <span class="table-title">{{ resolvedMenuItem.name }}</span>
            <a-tag v-if="selectedKeys.length > 0" color="arcoblue" size="small">
              已选 {{ selectedKeys.length }} 项
            </a-tag>
          </a-space>
          <a-space>
            <a-button
              v-if="selectedKeys.length > 0 && mainKey"
              status="danger"
              size="small"
              @click="batchRemove"
            >
              批量删除
            </a-button>
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

        <BusinessTable
          ref="tableRef"
          :schema="tableSchema"
          :api="api"
          :api-params="apiParams"
          :buttons="rowButtons"
          :row-selection="hasBatch"
          :row-key="mainKey || 'id'"
          @operate="onOperate"
          @selection-change="onSelectionChange"
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
      <a-drawer v-model:visible="detailVisible" :title="detailTitle" :width="440" unmount-on-close>
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
import BusinessTable from "../components/business-table.vue";
import { useAdminStore } from "../stores/admin";
import { request } from "../../common/auth";

/**
 * 通用 schema CRUD 页（自建版 schema-view）：由 Dashboard DSL 的 schemaConfig
 * 驱动——一份字段 schema 按 <视图>Option 拆分进 搜索栏/表格/表单/详情 四个视图，
 * 按钮与动态抽屉来自 tableConfig。与框架 schema-view 同一套机制，UI 为管理台风格。
 *
 * 两种使用方式：
 * 1. 路由页 /view/admin/schema/:key —— 从菜单树解析菜单项
 * 2. 组件（sider 视图内嵌）—— 通过 props.menuItem 传入子菜单项
 *
 * 内置按钮语义：showComponent / delete（框架契约）+ patch（业务扩展：状态流转，
 * eventOption.params 的取值语法与 delete 一致，支持 "schema::<field>" 取行值，
 * 配 confirm 文案时先弹确认框）+ batchRemove（配合 rowSelection 批量删除）。
 */

const props = defineProps({
  /** sider 视图内嵌时直接传入子菜单项；缺省时从当前路由解析 */
  menuItem: { type: Object, default: null },
});

const route = useRoute();
const store = useAdminStore();

const resolvedMenuItem = computed(
  () => props.menuItem || store.findMenuItem("key", String(route.params.key))
);

// DSL 菜单的 roles RBAC：无权限渲染 403
const forbidden = computed(() => {
  const item = resolvedMenuItem.value;
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

// URL query 预填搜索默认值（与框架 schema-view 同一行为）：
// 路由 query 中与字段同名的参数覆盖 option.default，实现「带着搜索条件跳转」。
// 仅对标量控件（input / select / dynamicSelect）生效，dateRange / numberRange 忽略。
const URL_PREFILL_TYPES = ["input", "select", "dynamicSelect"];

function buildSearchSchema(schema) {
  const dto = buildDtoSchema(schema, "search");
  for (const [key, field] of Object.entries(dto.properties)) {
    const value = route.query[key];
    if (
      value !== undefined &&
      URL_PREFILL_TYPES.includes(field.option?.componentType)
    ) {
      field.option.default = String(value);
    }
  }
  return dto;
}

const schemaConfig = computed(() => resolvedMenuItem.value?.schemaConfig || {});
const api = computed(() => schemaConfig.value.api || "");
const searchSchema = computed(() => buildSearchSchema(schemaConfig.value.schema));
const tableSchema = computed(() => buildDtoSchema(schemaConfig.value.schema, "table"));
const headerButtons = computed(
  () => schemaConfig.value.tableConfig?.headerButtons || []
);
const rowButtons = computed(() => schemaConfig.value.tableConfig?.rowButtons || []);

// 主键解析：editForm → detailPanel → createForm 顺序取第一个配了 mainKey 的组件
const mainKey = computed(() => {
  const config = schemaConfig.value.tableConfig?.componentConfig || {};
  return (
    config.editForm?.mainKey ||
    config.detailPanel?.mainKey ||
    config.createForm?.mainKey ||
    ""
  );
});

// ── 批量删除（rowSelection）──
// DSL tableConfig.rowSelection === true（或 headerButtons 配了 batchRemove）时启用行选择
const hasBatch = computed(() => {
  const config = schemaConfig.value.tableConfig;
  if (!mainKey.value) return false;
  return (
    config?.rowSelection === true ||
    (config?.headerButtons || []).some((btn) => btn.eventKey === "batchRemove")
  );
});
const tableRef = ref(null);
const selectedKeys = ref([]);

const onSelectionChange = (keys) => {
  selectedKeys.value = keys || [];
};

const batchRemove = () => {
  const keys = tableRef.value?.getSelection() || [];
  if (keys.length === 0) {
    Message.warning("请先勾选要删除的数据");
    return;
  }
  Modal.confirm({
    title: "批量删除确认",
    content: `共选中 ${keys.length} 条数据，删除后不可恢复，确定继续吗？`,
    okButtonProps: { status: "danger" },
    onOk: async () => {
      for (const key of keys) {
        await request({
          method: "delete",
          url: api.value,
          data: { [mainKey.value]: key },
        });
      }
      Message.success(`已删除 ${keys.length} 条数据`);
      refreshTable();
    },
  });
};

// ── 搜索参数（替换引用触发表格重新加载）──
const apiParams = ref({});

const onSearch = (values) => {
  apiParams.value = { ...values };
};
const onReset = () => {
  apiParams.value = {};
};

// ── 动态抽屉（createForm / editForm / detailPanel）──
const drawerVisible = ref(false);
const detailVisible = ref(false);
const drawerTitle = ref("");
const detailTitle = ref("");
const drawerType = ref("");
const formRef = ref(null);
const formSchema = ref({ type: "object", properties: {} });
const formModel = ref(null);
const saving = ref(false);
const editingRow = ref(null);
const detailRows = ref([]);

const openCreateForm = () => {
  drawerType.value = "createForm";
  drawerTitle.value =
    schemaConfig.value.tableConfig?.componentConfig?.createForm?.title || "创建";
  formSchema.value = buildDtoSchema(schemaConfig.value.schema, "createForm");
  formModel.value = null;
  editingRow.value = null;
  drawerVisible.value = true;
};

const openEditForm = (rowData) => {
  const componentConfig = schemaConfig.value.tableConfig?.componentConfig;
  if (!componentConfig?.editForm?.mainKey) {
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
  request({
    method: "get",
    url: api.value,
    query: { [componentConfig.editForm.mainKey]: rowData[componentConfig.editForm.mainKey] },
  }).then((res) => {
    if (res?.success) {
      formModel.value = res.data;
    }
  });
};

const openDetailPanel = (rowData) => {
  const componentConfig = schemaConfig.value.tableConfig?.componentConfig;
  const detailKey = componentConfig?.detailPanel?.mainKey;
  detailTitle.value = componentConfig?.detailPanel?.title || "详情";
  detailVisible.value = true;
  detailRows.value = [];

  request({
    method: "get",
    url: api.value,
    query: { [detailKey]: rowData[detailKey] },
  }).then((res) => {
    if (!res?.success) return;
    // 字段配置了 detailPanelOption 才展示（枚举翻译为 label）
    const detailSchema = buildDtoSchema(schemaConfig.value.schema, "detailPanel");
    detailRows.value = Object.keys(detailSchema.properties).map((key) => {
      const field = detailSchema.properties[key];
      const enumList = field.option?.enumList;
      const hit = enumList?.find((item) => String(item.value) === String(res.data[key]));
      return { label: field.label, value: hit ? hit.label : res.data[key] ?? "-" };
    });
  });
};

const saveForm = async () => {
  if (!formRef.value?.validate()) return;
  const value = formRef.value.getValue();
  saving.value = true;

  const isEdit = drawerType.value === "editForm";
  const editMainKey = schemaConfig.value.tableConfig?.componentConfig?.editForm?.mainKey;
  const res = await request({
    method: isEdit ? "put" : "post",
    url: api.value,
    data: isEdit ? { ...value, [editMainKey]: editingRow.value[editMainKey] } : value,
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
  const [paramKey, paramExpr] =
    Object.entries(btnConfig.eventOption?.params || {})[0] || [];
  const value = resolveParam(paramExpr, rowData);

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

/** "schema::<field>" 取行值，其余按静态值处理（与框架 delete 契约一致） */
const resolveParam = (expr, rowData) => {
  if (String(expr || "").startsWith("schema::")) {
    return rowData[expr.slice("schema::".length)];
  }
  return expr;
};

// patch：业务扩展的状态流转按钮。eventOption.params 支持多字段，
// 配 confirm 文案时先弹确认框。
const patchRecord = (btnConfig, rowData) => {
  const patchMainKey = mainKey.value;
  if (!patchMainKey) {
    Message.warning("patch 按钮需要 componentConfig 配置 mainKey");
    return;
  }
  const patch = { [patchMainKey]: rowData[patchMainKey] };
  for (const [key, expr] of Object.entries(btnConfig.eventOption?.params || {})) {
    patch[key] = resolveParam(expr, rowData);
  }

  const doPatch = async () => {
    const res = await request({ method: "patch", url: api.value, data: patch });
    if (res?.success) {
      Message.success("操作成功");
      refreshTable();
    }
  };

  if (btnConfig.eventOption?.confirm) {
    Modal.confirm({
      title: "操作确认",
      content: btnConfig.eventOption.confirm,
      onOk: doPatch,
    });
  } else {
    doPatch();
  }
};

// ── 按钮事件分发 ──
const onHeaderButton = (btnConfig) => {
  if (btnConfig.eventKey === "showComponent") {
    if (btnConfig.eventOption?.comName === "createForm") openCreateForm();
    return;
  }
  if (btnConfig.eventKey === "batchRemove") {
    batchRemove();
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
    return;
  }
  if (btnConfig.eventKey === "patch") {
    patchRecord(btnConfig, rowData);
  }
};

// 路由变化（菜单切换）时重置搜索条件
watch(
  () => resolvedMenuItem.value?.key,
  () => {
    apiParams.value = {};
  }
);
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
