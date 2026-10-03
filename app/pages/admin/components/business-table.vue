<template>
  <div class="business-table">
    <a-table
      v-if="schema && schema.properties"
      :loading="loading"
      :data="tableData"
      :pagination="false"
      :row-key="rowKey"
      :row-selection="
        rowSelection
          ? { type: 'checkbox', showCheckedAll: true, selectedKeys: selectedKeys }
          : undefined
      "
      stripe
      class="table"
      @selection-change="onSelectionChange"
    >
      <template #columns>
        <template v-for="(schemaItem, key) in schema.properties" :key="key">
          <a-table-column
            v-if="schemaItem.option?.visible !== false"
            :title="schemaItem.label"
            :data-index="key"
            v-bind="columnOption(schemaItem)"
          >
            <template v-if="enumListOf(schemaItem).length > 0" #cell="{ record }">
              <a-tag :color="enumColor(enumListOf(schemaItem), record[key])" class="enum-tag">
                {{ enumLabel(enumListOf(schemaItem), record[key]) }}
              </a-tag>
            </template>
            <template v-else-if="schemaItem.option?.toFixed !== undefined" #cell="{ record }">
              {{ formatNumber(record[key], schemaItem.option?.toFixed) }}
            </template>
          </a-table-column>
        </template>
        <a-table-column
          v-if="buttons?.length > 0"
          title="操作"
          fixed="right"
          :width="operationWidth"
        >
          <template #cell="scoped">
            <a-space :size="4">
              <a-button
                v-for="item in visibleButtons(scoped.record)"
                :key="item.label"
                :status="item.type"
                type="text"
                @click="emit('operate', { btnConfig: item, rowData: scoped.record })"
              >
                {{ item.label }}
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
    <a-row class="pagination" justify="end">
      <a-pagination
        :current="currentPage"
        :page-size="pageSize"
        :page-size-options="[10, 20, 50, 100, 200]"
        :total="total"
        show-total
        show-jumper
        show-page-size
        @page-size-change="onPageSizeChange"
        @change="onPageChange"
      />
    </a-row>
  </div>
</template>

<script setup>
// 管理台业务表格：与框架 schema-table 同一 props 契约（schema/api/apiParams/buttons），
// 在此之上扩展两个业务能力：
// 1. 行按钮 visibleWhen：按行数据决定按钮显隐（DSL rowButtons 上的业务扩展字段）
// 2. rowSelection 行选择：配合 schema-page 的 batchRemove 实现批量删除
import { computed, ref, toRefs, watch, onMounted } from "vue";
import $curl from "$lumfallCurl";

const props = defineProps({
  schema: Object,
  api: String,
  apiParams: Object,
  buttons: Array,
  rowSelection: { type: Boolean, default: false },
  rowKey: { type: String, default: "id" },
});

const { schema, api, apiParams } = toRefs(props);

const emit = defineEmits(["operate"]);

const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const selectedKeys = ref([]);

// ── 列配置 ──
const columnOption = (schemaItem) => {
  const { enumList, toFixed, visible, ...rest } = schemaItem.option || {};
  // 所有列默认 ellipsis + tooltip，防止长文本撑破列宽
  return { ellipsis: true, tooltip: true, ...rest };
};

const enumListOf = (schemaItem) => schemaItem.option?.enumList || [];

const ENUM_COLORS = [
  "orangered", "orange", "gold", "lime", "green", "cyan",
  "blue", "arcoblue", "purple", "pinkpurple", "magenta", "gray",
];

const enumColor = (list, value) => {
  const index = list.findIndex((item) => String(item.value) === String(value));
  return ENUM_COLORS[(index === -1 ? 0 : index) % ENUM_COLORS.length];
};

const enumLabel = (list, value) => {
  const hit = list.find((item) => String(item.value) === String(value));
  return hit ? hit.label : value ?? "-";
};

const formatNumber = (value, digits) => {
  if (value === undefined || value === null || value === "") return "-";
  return Number(value).toFixed(digits);
};

// ── 行按钮 visibleWhen 过滤 ──
const visibleButtons = (rowData) =>
  (props.buttons || []).filter((btn) => {
    const when = btn.visibleWhen;
    if (!when) return true;
    return String(rowData?.[when.field]) === String(when.value);
  });

const operationWidth = computed(() => {
  const list = props.buttons || [];
  if (list.length === 0) return 50;
  return 30 + list.reduce((sum, btn) => sum + btn.label.length * 14 + 26, 0);
});

// ── 数据加载：契约与框架 schema-table 一致（GET <api>/list，total 在 metadata）──
const loadTableData = async () => {
  loading.value = true;
  const res = await $curl({
    method: "get",
    url: `${api.value}/list`,
    query: {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...(apiParams.value || {}),
    },
  });
  loading.value = false;

  if (res?.success) {
    tableData.value = res.data || [];
    total.value = res.metadata?.total || 0;
  } else {
    tableData.value = [];
    total.value = 0;
  }
  selectedKeys.value = [];
};

watch(
  apiParams,
  () => {
    currentPage.value = 1;
    loadTableData();
  },
  { deep: true }
);

watch(api, () => {
  currentPage.value = 1;
  loadTableData();
});

onMounted(loadTableData);

const onPageChange = (page) => {
  currentPage.value = page;
  loadTableData();
};

const onPageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadTableData();
};

const onSelectionChange = (keys) => {
  selectedKeys.value = keys || [];
};

defineExpose({
  /** 当前勾选行的主键值列表 */
  getSelection: () => selectedKeys.value.slice(),
});
</script>

<style lang="less" scoped>
.business-table {
  .table {
    width: 100%;
  }

  .enum-tag {
    margin: 0;
  }

  .pagination {
    margin-top: 12px;
  }
}
</style>
