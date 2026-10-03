<template>
  <a-row align="center" justify="space-between" class="form-item">
    <a-row v-if="schema.label" class="item-label" justify="end" align="center">
      <a-row v-if="schema.option?.required" class="required" justify="end" align="center">
        *
      </a-row>
      {{ schema.label }}
    </a-row>
    <a-row class="item-value" justify="start" align="center">
      <a-rate v-model="dtoValue" v-bind="rateOption" class="component" allow-half />
      <span v-if="dtoValue !== undefined && dtoValue !== null" class="rate-value">
        {{ dtoValue }}
      </span>
    </a-row>
    <a-row v-if="validateTips" class="validate-tips">
      {{ validateTips }}
    </a-row>
  </a-row>
</template>

<script setup>
// 业务扩展表单控件：rate 评分（数值范围走 schema 的 minimum / maximum 校验）。
import { computed, inject, ref, toRefs, watch } from "vue";

const ajv = inject("ajv");

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: Number,
});
const { schema, model } = toRefs(props);

const name = ref("rate");
const dtoValue = ref();
const validateTips = ref(null);

const rateOption = computed(() => {
  const { componentType, ...rest } = schema.value.option || {};
  return rest;
});

const initData = () => {
  dtoValue.value = model.value ?? schema.value.option?.default;
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

  if (typeof dtoValue.value === "number") {
    const validateFn = ajv.compile(currentSchema);
    if (!validateFn(dtoValue.value)) {
      const { keyword, params } = validateFn.errors?.[0] || {};
      validateTips.value =
        keyword === "maximum"
          ? `${label}不能大于${params.limit}`
          : keyword === "minimum"
            ? `${label}不能小于${params.limit}`
            : `${label}不符合要求`;
      return false;
    }
  }
  return true;
};

const getValue = () =>
  dtoValue.value !== undefined ? { [props.schemaKey]: dtoValue.value } : {};

defineExpose({ validate, getValue, name });
</script>

<style lang="less" scoped>
.rate-value {
  margin-left: 8px;
  font-size: 13px;
  color: rgb(var(--orangered-6));
}
</style>
