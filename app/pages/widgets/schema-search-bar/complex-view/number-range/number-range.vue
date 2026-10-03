<template>
  <a-input-group class="number-range">
    <a-input-number
      v-model="minValue"
      class="range-input"
      :placeholder="placeholderList[0]"
      hide-button
      :min="min"
      :max="max"
    />
    <span class="range-separator">-</span>
    <a-input-number
      v-model="maxValue"
      class="range-input"
      :placeholder="placeholderList[1]"
      hide-button
      :min="min"
      :max="max"
    />
  </a-input-group>
</template>

<script setup>
// 业务扩展搜索控件：numberRange 数值区间（价格区间 / 金额区间）。
// 与框架 dateRange 同一拆参模式：getValue 下发 <fieldKey>_min / <fieldKey>_max，
// 未填的边界不下发；后端 store 按区间后缀过滤（plugin/store/index.js）。
import { onMounted, ref } from "vue";

const { schemaKey, schema } = defineProps({
  schemaKey: String,
  schema: Object,
});

const emit = defineEmits(["load"]);

const minValue = ref();
const maxValue = ref();

const placeholderList = schema.option?.placeholder || ["最小值", "最大值"];
const min = typeof schema.option?.minimum === "number" ? schema.option.minimum : undefined;
const max = typeof schema.option?.maximum === "number" ? schema.option.maximum : undefined;

const getValue = () => ({
  ...(minValue.value !== undefined && minValue.value !== null
    ? { [`${schemaKey}_min`]: minValue.value }
    : {}),
  ...(maxValue.value !== undefined && maxValue.value !== null
    ? { [`${schemaKey}_max`]: maxValue.value }
    : {}),
});

const reset = () => {
  minValue.value = undefined;
  maxValue.value = undefined;
};

onMounted(() => {
  reset();
  emit("load");
});

defineExpose({ getValue, reset });
</script>

<style lang="less" scoped>
.number-range {
  display: inline-flex;
  align-items: center;

  .range-input {
    width: 100px;
  }

  .range-separator {
    padding: 0 6px;
    color: var(--color-text-3);
  }
}
</style>
