<template>
  <a-row align="center" justify="space-between" class="form-item">
    <a-row v-if="schema.label" class="item-label" justify="end" align="center">
      <a-row v-if="schema.option?.required" class="required" justify="end" align="center">
        *
      </a-row>
      {{ schema.label }}
    </a-row>
    <a-row class="item-value" justify="start" align="center">
      <a-switch v-model="checked" v-bind="switchOption" class="component" />
    </a-row>
    <a-row v-if="validateTips" class="validate-tips">
      {{ validateTips }}
    </a-row>
  </a-row>
</template>

<script setup>
// 业务扩展表单控件：switch 开关。schema 值形如 "1"/"0"（字符串枚举），
// 内部与布尔互相映射，提交时始终回写为 checkedValue/uncheckedValue 对应值。
import { computed, inject, ref, toRefs, watch } from "vue";

const ajv = inject("ajv");

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: [String, Number, Boolean],
});
const { schema, model } = toRefs(props);

const name = ref("switch");
const dtoValue = ref();
const validateTips = ref(null);

// checkedValue / uncheckedValue 可由 DSL option 覆盖，默认 "1"/"0"
const checkedValue = computed(() => schema.value.option?.checkedValue ?? "1");
const uncheckedValue = computed(() => schema.value.option?.uncheckedValue ?? "0");

const checked = computed({
  get() {
    return String(dtoValue.value) === String(checkedValue.value);
  },
  set(value) {
    dtoValue.value = value ? checkedValue.value : uncheckedValue.value;
  },
});

// a-switch 自身的 checkedValue/uncheckedValue 与 v-model 双绑会打架，只透传安全属性
const switchOption = computed(() => {
  const { componentType, checkedValue: _c, uncheckedValue: _u, ...rest } = schema.value.option || {};
  return rest;
});

const initData = () => {
  const currentSchema = schema.value;
  if (model.value !== undefined && model.value !== null) {
    dtoValue.value = model.value;
  } else if (currentSchema.option?.default !== undefined) {
    dtoValue.value = currentSchema.option.default;
  } else {
    dtoValue.value = uncheckedValue.value;
  }
  validateTips.value = null;
};

watch([model, schema], initData, { immediate: true, deep: true });

const validate = () => {
  validateTips.value = null;
  const currentSchema = schema.value;
  const label = currentSchema.label || props.schemaKey;
  if (
    currentSchema.option?.required &&
    (dtoValue.value === undefined || dtoValue.value === null)
  ) {
    validateTips.value = `${label}不能为空`;
    return false;
  }
  return true;
};

const getValue = () =>
  dtoValue.value !== undefined ? { [props.schemaKey]: dtoValue.value } : {};

defineExpose({ validate, getValue, name });
</script>

<style lang="less" scoped></style>
