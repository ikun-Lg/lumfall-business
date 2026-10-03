<template>
  <a-row align="center" justify="space-between" class="form-item">
    <a-row v-if="schema.label" class="item-label" justify="end" align="center">
      <a-row v-if="schema.option?.required" class="required" justify="end" align="center">
        *
      </a-row>
      {{ schema.label }}
    </a-row>
    <a-row class="item-value" justify="start" align="center">
      <a-textarea
        v-model="dtoValue"
        v-bind="schema.option"
        class="component"
        :placeholder="placeholder"
        :auto-size="{ minRows: 3, maxRows: 6 }"
        allow-clear
        @blur="onBlur"
      />
    </a-row>
    <a-row v-if="validateTips" class="validate-tips">
      {{ validateTips }}
    </a-row>
  </a-row>
</template>

<script setup>
// 业务扩展表单控件：textarea 多行文本（schema-form 通过 form-item-config 注册消费）。
// 与框架内置控件同一契约：props schemaKey/schema/model，inject ajv，
// defineExpose validate / getValue / name。
import { inject, ref, toRefs, watch } from "vue";

const ajv = inject("ajv");

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: String,
});
const { schema, model } = toRefs(props);

const name = ref("textarea");
const dtoValue = ref();
const validateTips = ref(null);
const placeholder = ref("");

const initData = () => {
  const currentSchema = schema.value;
  dtoValue.value = model.value ?? currentSchema.option?.default;
  validateTips.value = null;

  const ruleList = [];
  if (currentSchema.option?.placeholder) ruleList.push(currentSchema.option.placeholder);
  if (currentSchema.maxLength) ruleList.push(`最多${currentSchema.maxLength}个字符`);
  placeholder.value = ruleList.join("|");
};

watch([model, schema], initData, { immediate: true, deep: true });

const validate = () => {
  validateTips.value = null;
  const currentSchema = schema.value;
  const label = currentSchema.label || props.schemaKey;

  if (currentSchema.option?.required && !dtoValue.value) {
    validateTips.value = `${label}不能为空`;
    return false;
  }

  if (dtoValue.value) {
    const validateFn = ajv.compile(currentSchema);
    if (!validateFn(dtoValue.value)) {
      const { keyword, params } = validateFn.errors?.[0] || {};
      if (keyword === "maxLength") {
        validateTips.value = `${label}长度不能超过${params.limit}`;
      } else {
        validateTips.value = `${label}不符合要求`;
      }
      return false;
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
