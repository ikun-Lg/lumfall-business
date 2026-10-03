<template>
  <a-row align="center" justify="space-between" class="form-item">
    <a-row v-if="schema.label" class="item-label" justify="end" align="center">
      <a-row v-if="schema.option?.required" class="required" justify="end" align="center">
        *
      </a-row>
      {{ schema.label }}
    </a-row>
    <a-row class="item-value" justify="start" align="center">
      <a-select
        v-model="dtoValue"
        :options="enumList"
        v-bind="selectOption"
        class="component"
        :loading="loading"
        :placeholder="placeholder"
        allow-search
        @change="onBlur"
      />
    </a-row>
    <a-row v-if="validateTips" class="validate-tips">
      {{ validateTips }}
    </a-row>
  </a-row>
</template>

<script setup>
// 业务扩展表单控件：dynamicSelect 动态下拉。
// 框架表单侧原本只注册了静态 enumList 的 select；该控件让表单字段可以像搜索栏的
// dynamicSelect 一样按 option.api 拉取 {label, value} 选项（外键字段必备）。
import { computed, inject, onMounted, ref, toRefs, watch } from "vue";
import $curl from "$lumfallCurl";

const ajv = inject("ajv");

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: [String, Number],
});
const { schema, model } = toRefs(props);

const name = ref("dynamicSelect");
const dtoValue = ref();
const enumList = ref([]);
const loading = ref(false);
const validateTips = ref(null);

const selectOption = computed(() => {
  const { componentType, api, ...rest } = schema.value.option || {};
  return rest;
});

const placeholder = computed(
  () => schema.value.option?.placeholder || `请选择${schema.value.label}`
);

const initData = () => {
  dtoValue.value = model.value ?? schema.value.option?.default ?? "";
  validateTips.value = null;
};

watch([model, schema], initData, { immediate: true, deep: true });

const fetchEnumList = async () => {
  const api = schema.value.option?.api;
  if (!api) return;
  loading.value = true;
  const res = await $curl({ method: "get", url: api, data: {} });
  loading.value = false;
  if (res?.data?.length > 0) {
    enumList.value = res.data;
  }
};

onMounted(fetchEnumList);

const validate = () => {
  validateTips.value = null;
  const currentSchema = schema.value;
  const label = currentSchema.label || props.schemaKey;

  if (
    currentSchema.option?.required &&
    (dtoValue.value === undefined || dtoValue.value === null || dtoValue.value === "")
  ) {
    validateTips.value = `${label}不能为空`;
    return false;
  }

  if (dtoValue.value !== undefined && dtoValue.value !== null && dtoValue.value !== "") {
    // 以服务端返回的选项值为枚举做 ajv 校验
    const dtoEnum = enumList.value.map((item) => item.value);
    if (dtoEnum.length > 0) {
      const validateFn = ajv.compile({ ...currentSchema, enum: dtoEnum });
      if (!validateFn(dtoValue.value)) {
        validateTips.value = `${label}选项无效`;
        return false;
      }
    }
  }
  return true;
};

const getValue = () =>
  dtoValue.value !== undefined ? { [props.schemaKey]: dtoValue.value } : {};

const onBlur = () => validate();

defineExpose({ validate, getValue, name });
</script>

<style lang="less" scoped></style>
