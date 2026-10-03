<template>
  <a-row align="center" justify="space-between" class="form-item">
    <a-row v-if="schema.label" class="item-label" justify="end" align="center">
      <a-row v-if="schema.option?.required" class="required" justify="end" align="center">
        *
      </a-row>
      {{ schema.label }}
    </a-row>
    <a-row class="item-value" justify="start" align="center">
      <a-radio-group v-model="dtoValue" v-bind="radioOption" class="component" @change="onBlur">
        <a-radio v-for="item in enumList" :key="item.value" :value="item.value">
          {{ item.label }}
        </a-radio>
      </a-radio-group>
    </a-row>
    <a-row v-if="validateTips" class="validate-tips">
      {{ validateTips }}
    </a-row>
  </a-row>
</template>

<script setup>
// 业务扩展表单控件：radioGroup 单选组（横排，适合状态 / 类型这类 2-4 个选项的字段）。
import { computed, inject, ref, toRefs, watch } from "vue";

const ajv = inject("ajv");

const props = defineProps({
  schemaKey: String,
  schema: Object,
  model: [String, Number, Boolean],
});
const { schema, model } = toRefs(props);

const name = ref("radioGroup");
const dtoValue = ref();
const validateTips = ref(null);

const enumList = computed(() => schema.value.option?.enumList || []);
const radioOption = computed(() => {
  const { componentType, enumList: _e, ...rest } = schema.value.option || {};
  return rest;
});

const initData = () => {
  dtoValue.value = model.value ?? schema.value.option?.default ?? "";
  validateTips.value = null;
};

watch([model, schema], initData, { immediate: true, deep: true });

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
    const dtoEnum = enumList.value.map((item) => item.value);
    const validateFn = ajv.compile({ ...currentSchema, enum: dtoEnum });
    if (!validateFn(dtoValue.value)) {
      validateTips.value = `${label}选项无效`;
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
