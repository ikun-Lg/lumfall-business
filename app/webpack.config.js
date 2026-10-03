// 扩展 Webpack 配置（与框架配置 merge.smart 合并）。
// 关闭模块拼接（scope hoisting）：本项目 admin 布局链上的多个 SFC
// （admin-layout / header-bar / side-menu）被拼接进同一 chunk 作用域时，
// 曾出现跨模块组件绑定错位（导入的菜单组件被解析成同名局部函数，
// 渲染成空的注释占位且无任何报错）。关掉后每个模块保留独立闭包，杜绝此问题。
module.exports = {
  optimization: {
    concatenateModules: false,
  },
};
