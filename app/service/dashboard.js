// 概览与统计 service：基于 store 插件的真实 mock 数据做聚合。
// 一个管理台承载电商 / 课程两套系统：接口用 domain 参数区分聚合口径，
// 前端切换系统后带 domain 重拉即可，接口形状保持不变。
module.exports = (app) => {
  const BaseService = require("lumfall").Service.Base(app);

  // 依据日期生成伪随机但日内稳定的数值（访问量这类无法从 mock 记录聚合的指标）
  const seededValue = (seed, min, max) => {
    const x = Math.sin(seed) * 10000;
    const ratio = x - Math.floor(x);
    return Math.round(min + ratio * (max - min));
  };

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const isToday = (time) => String(time || "").slice(0, 10) === todayKey();

  const dayKeyOf = (time) => String(time || "").slice(0, 10);

  // 近 N 日聚合：按 createTime 的日期前缀分组
  const dailySeries = (rows, days, valueOf) => {
    const dates = [];
    const values = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      dates.push(day.slice(5)); // MM-DD
      values.push(
        rows
          .filter((row) => dayKeyOf(row.createTime) === day)
          .reduce((sum, row) => sum + valueOf(row), 0)
      );
    }
    return { dates, values };
  };

  return class DashboardService extends BaseService {
    get repo() {
      return this.app.plugins.store.store;
    }

    /** 统计卡片（domain: commerce | course） */
    getStats(domain = "commerce") {
      const seedBase = Number(todayKey().replace(/-/g, ""));

      if (domain === "course") {
        const orders = this.repo.collection("courseOrder").all();
        return {
          todayOrders: orders.filter((row) => isToday(row.createTime)).length,
          todaySales: Math.round(orders.filter((row) => isToday(row.createTime)).reduce((sum, row) => sum + row.amount, 0)),
          userCount: this.repo.collection("student").count(),
          visitCount: seededValue(seedBase + 7, 800, 2600),
        };
      }

      const orders = this.repo.collection("order").all();
      return {
        todayOrders: orders.filter((row) => isToday(row.createTime)).length,
        todaySales: Math.round(orders.filter((row) => isToday(row.createTime)).reduce((sum, row) => sum + row.totalAmount, 0)),
        userCount: this.repo.collection("customer").count(),
        visitCount: seededValue(seedBase + 3, 1500, 4000),
      };
    }

    /** 近 7 日订单与销售额趋势（domain: commerce | course） */
    getTrends(domain = "commerce") {
      const rows =
        domain === "course"
          ? this.repo.collection("courseOrder").all()
          : this.repo.collection("order").all();

      const orders = dailySeries(rows, 7, () => 1);
      const sales = dailySeries(rows, 7, (row) =>
        domain === "course" ? row.amount : row.totalAmount
      );
      return { dates: orders.dates, orders: orders.values, sales: sales.values };
    }

    /** 分类维度占比（domain: commerce | course），供饼图消费 */
    getCategoryDist(domain = "commerce") {
      if (domain === "course") {
        const courses = this.repo.collection("course").all();
        const categories = this.repo.collection("courseCategory").all();
        return categories.map((category) => ({
          name: category.categoryName,
          value: courses
            .filter((row) => row.categoryId === category.categoryId)
            .reduce((sum, row) => sum + row.price, 0),
        }));
      }

      const products = this.repo.collection("product").all();
      const categories = this.repo.collection("category").all();
      return categories.map((category) => ({
        name: category.categoryName,
        value: products
          .filter((row) => row.categoryId === category.categoryId)
          .reduce((sum, row) => sum + row.price * row.sales, 0),
      }));
    }

    /** 电商 · 销售分析（sider 视图） */
    getSalesAnalysis() {
      const orders = this.repo.collection("order").all();
      const products = this.repo.collection("product").all();

      const trend = dailySeries(orders, 30, (row) => row.totalAmount);
      const orderCount = dailySeries(orders, 30, () => 1);

      const statusCount = {};
      for (const row of orders) statusCount[row.status] = (statusCount[row.status] || 0) + 1;

      const payCount = {};
      for (const row of orders) payCount[row.payType] = (payCount[row.payType] || 0) + 1;

      const topProducts = [...products]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10)
        .map((row) => ({ name: row.productName, value: row.sales }));

      return {
        trend: { dates: trend.dates, sales: trend.values, orders: orderCount.values },
        statusDist: statusCount,
        payTypeDist: payCount,
        topProducts,
      };
    }

    /** 课程 · 学习分析（sider 视图） */
    getLearningAnalysis() {
      const orders = this.repo.collection("courseOrder").all();
      const courses = this.repo.collection("course").all();

      const trend = dailySeries(orders, 30, (row) => row.amount);
      const enrollCount = dailySeries(orders, 30, () => 1);

      const statusCount = {};
      for (const row of orders) statusCount[row.status] = (statusCount[row.status] || 0) + 1;

      const difficultyCount = {};
      for (const row of courses) difficultyCount[row.difficulty] = (difficultyCount[row.difficulty] || 0) + 1;

      const topCourses = [...courses]
        .sort((a, b) => b.price - a.price)
        .slice(0, 10)
        .map((row) => ({ name: row.courseName, value: Math.round(row.price) }));

      return {
        trend: { dates: trend.dates, sales: trend.values, orders: enrollCount.values },
        statusDist: statusCount,
        difficultyDist: difficultyCount,
        topCourses,
      };
    }
  };
};
