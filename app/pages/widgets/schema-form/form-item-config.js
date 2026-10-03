// 业务侧表单控件注册表：与框架内置注册表（schema-form/form-item-config.js）展开合并，
// 同名覆盖、新名追加（webpack 别名 $businessFormItemConfig 注入）。
// 组件契约与框架一致：props schemaKey/schema/model，inject("ajv")，
// defineExpose({ validate, getValue, name })。
import textarea from "./complex-view/textarea/textarea.vue";
import switchControl from "./complex-view/switch/switch.vue";
import radioGroup from "./complex-view/radio-group/radio-group.vue";
import rate from "./complex-view/rate/rate.vue";
import dynamicSelect from "./complex-view/dynamic-select/dynamic-select.vue";

const BusinessFormItemConfig = {
  textarea: { component: textarea },
  switch: { component: switchControl },
  radioGroup: { component: radioGroup },
  rate: { component: rate },
  dynamicSelect: { component: dynamicSelect },
};

export default BusinessFormItemConfig;
