// Dashboard 概览接口（全部需要登录态，jwt-verify 默认拦截）
module.exports = (app) => {
  const BaseController = require("lumfall").Controller.Base(app);

  return class DashboardController extends BaseController {
    async getStats(ctx) {
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, dashboardService.getStats());
    }

    async getTrends(ctx) {
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, {
        trends: dashboardService.getTrends(),
        categories: dashboardService.getCategoryDist(),
      });
    }
  };
};
