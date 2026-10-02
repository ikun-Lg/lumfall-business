// Dashboard 概览数据 service（mock）。接入真实数据时换成聚合查询即可，
// 接口形状（stats / trends）保持不变，前端无需改动。
module.exports = (app) => {
  const BaseService = require("lumfall").Service.Base(app);

  // 依据日期生成伪随机但日内稳定的 mock 数值，避免每次刷新图表跳动
  const seededValue = (seed, min, max) => {
    const x = Math.sin(seed) * 10000;
    const ratio = x - Math.floor(x);
    return Math.round(min + ratio * (max - min));
  };

  return class DashboardService extends BaseService {
    /** 统计卡片 */
    getStats() {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return {
        todayOrders: seededValue(Number(today), 80, 260),
        todaySales: seededValue(Number(today) + 1, 6000, 20000),
        userCount: seededValue(Number(today) + 2, 60, 120),
        visitCount: seededValue(Number(today) + 3, 1500, 4000),
      };
    }

    /** 近 7 日趋势（折线图） */
    getTrends() {
      const dates = [];
      const orders = [];
      const sales = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(Date.now() - i * 86400000);
        const seed = Number(day.toISOString().slice(0, 10).replace(/-/g, ""));
        dates.push(`${day.getMonth() + 1}-${day.getDate()}`);
        orders.push(seededValue(seed, 60, 280));
        sales.push(seededValue(seed + 1, 5000, 22000));
      }
      return { dates, orders, sales };
    }

    /** 商品分类占比（饼图，与商品管理 productType 枚举对应） */
    getCategoryDist() {
      return [
        { name: "电子数码", value: 428 },
        { name: "服饰鞋包", value: 315 },
        { name: "家居生活", value: 260 },
      ];
    }
  };
};
