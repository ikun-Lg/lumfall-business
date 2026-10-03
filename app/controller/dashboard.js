// 概览与统计接口（全部需要登录态，jwt-verify 默认拦截）。
// domain 参数区分电商 / 课程两个系统的聚合口径。
const VALID_DOMAINS = ["commerce", "course"];

module.exports = (app) => {
  const BaseController = require("lumfall").Controller.Base(app);

  return class DashboardController extends BaseController {
    async getStats(ctx) {
      const { domain } = ctx.request.query;
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, dashboardService.getStats(domain));
    }

    async getTrends(ctx) {
      const { domain } = ctx.request.query;
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, {
        trends: dashboardService.getTrends(domain),
        categories: dashboardService.getCategoryDist(domain),
      });
    }

    /** 电商 · 销售分析 */
    async getSalesAnalysis(ctx) {
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, dashboardService.getSalesAnalysis());
    }

    /** 课程 · 学习分析 */
    async getLearningAnalysis(ctx) {
      const { dashboard: dashboardService } = this.services;
      await this.success(ctx, dashboardService.getLearningAnalysis());
    }
  };
};
