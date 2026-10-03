// 健康检查：注册 store 插件探针。
// GET /health/ready 会并行执行探针，store 不可用时返回 503。
module.exports = (app) => {
  app.health.register("store", async () => {
    return app.plugins.store.store.ping();
  });
  return {};
};
