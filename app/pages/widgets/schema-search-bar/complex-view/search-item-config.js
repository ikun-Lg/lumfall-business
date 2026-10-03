// 业务侧搜索控件注册表：与框架内置注册表（schema-search-bar/complex-view/search-item-config.js）
// 展开合并，同名覆盖、新名追加（webpack 别名 $businessSearchItemConfig 注入）。
// 组件契约与框架一致：props schemaKey/schema，defineExpose({ getValue, reset })，mounted 后 emit("load")。
import numberRange from "./number-range/number-range.vue";

const BusinessSearchItemConfig = {
  numberRange: { component: numberRange },
};

export default BusinessSearchItemConfig;
