const { serviceStart } = require("lumfall");
const { createStore } = require("./plugin/store");
const { buildSeedData } = require("./plugin/store/seed");

const app = serviceStart({
  // 应用名：渲染页面模板 <title> 时使用
  name: "lumfall-business",

  // 未命中任何路由时的 302 兜底目标
  homePath: "/view/login",

  // ── 配置强约束：合并后的 config 不满足即启动失败，指出环境 / 字段 / 原因 ──
  configSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      apiBasePath: { type: "string" },
      security: {
        type: "object",
        properties: {
          jwt: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              maxAgeSeconds: { type: "number" },
              cookieName: { type: "string" },
            },
          },
        },
      },
    },
  },

  // ── 插件：内存数据仓库，先于业务中间件 / 路由装配（app.plugins.store）──
  plugins: [
    {
      name: "store",
      register() {
        return { store: createStore(buildSeedData()) };
      },
    },
  ],

  // ── 生命周期：启动完成后输出诊断摘要，便于确认菜单 / 路由加载结果 ──
  lifecycle: {
    afterStart(appInstance) {
      const manifest = appInstance.diagnostics.getManifest();
      const healthNames = manifest.healthChecks
        .map((item) => item?.name || item)
        .join(",");
      appInstance.logger.info(
        `[startup] env=${manifest.environment} routes=${manifest.routes.length} pages=${manifest.pages.length} healthChecks=${healthNames}`
      );
    },
  },

  // ── 请求观测：traceId 贯穿请求日志 ──
  monitoring: {
    traceHeader: "x-trace-id",
    onRequestStart({ traceId, method, path }) {
      app.logger.info(`[trace] --> ${method} ${path} traceId=${traceId}`);
    },
    onRequestEnd({ traceId, method, path, status, durationMs }) {
      app.logger.info(
        `[trace] <-- ${method} ${path} ${status} ${durationMs}ms traceId=${traceId}`
      );
    },
    onRequestError({ traceId, method, path, error }) {
      app.logger.error(`[trace] !! ${method} ${path} traceId=${traceId} error=${error.message}`);
    },
  },
});

module.exports = app;
