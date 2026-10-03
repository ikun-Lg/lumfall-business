<template>
  <div class="analysis-view">
    <a-row :gutter="16">
      <!-- 近 30 日趋势：柱（销售额 / 收入）+ 线（订单量） -->
      <a-col :xs="24" :lg="16">
        <div class="chart-card">
          <div class="chart-title">近 30 日{{ trendTitle }}</div>
          <div ref="trendRef" class="chart-body"></div>
        </div>
      </a-col>

      <!-- 状态 / 难度分布 -->
      <a-col :xs="24" :lg="8">
        <div class="chart-card">
          <div class="chart-title">{{ distTitle }}</div>
          <div ref="distRef" class="chart-body"></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="second-row">
      <!-- Top 榜：销量 Top 商品 / 收入 Top 课程 -->
      <a-col :span="24">
        <div class="chart-card">
          <div class="chart-title">{{ topTitle }}</div>
          <div ref="topRef" class="chart-body-top"></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
// 领域分析视图（sider 视图 custom 子项的落点）：
// domain = commerce → /api/analysis/sales（销售分析）
// domain = course   → /api/analysis/learning（学习分析）
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { request } from "../../common/auth";

const props = defineProps({
  domain: { type: String, default: "commerce" },
});

const isCommerce = () => props.domain === "commerce";

const trendTitle = isCommerce() ? "销售额与订单量" : "课程收入与报名量";
const distTitle = isCommerce() ? "订单状态分布" : "订单状态分布";
const topTitle = isCommerce() ? "销量 Top 10 商品" : "定价 Top 10 课程";

const STATUS_LABELS = {
  commerce: {
    pending: "待付款",
    paid: "已付款",
    shipped: "已发货",
    completed: "已完成",
    canceled: "已取消",
  },
  course: {
    paid: "已支付",
    refunding: "退款中",
    refunded: "已退款",
  },
};

const trendRef = ref(null);
const distRef = ref(null);
const topRef = ref(null);

let trendChart = null;
let distChart = null;
let topChart = null;
let onResize = null;

const PRIMARY = "#165dff";
const TEAL = "#14c9c9";

const renderTrend = (trend) => {
  trendChart.setOption(
    {
      tooltip: { trigger: "axis" },
      legend: { data: [isCommerce() ? "销售额" : "收入", isCommerce() ? "订单量" : "报名量"], bottom: 0 },
      grid: { left: 56, right: 56, top: 32, bottom: 48 },
      xAxis: { type: "category", data: trend.dates, boundaryGap: false },
      yAxis: [
        { type: "value", name: isCommerce() ? "销售额" : "收入" },
        { type: "value", name: isCommerce() ? "订单量" : "报名量", splitLine: { show: false } },
      ],
      dataZoom: [{ type: "inside" }],
      series: [
        {
          name: isCommerce() ? "销售额" : "收入",
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          data: trend.sales,
          itemStyle: { color: PRIMARY, borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 14,
        },
        {
          name: isCommerce() ? "订单量" : "报名量",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: trend.orders,
          itemStyle: { color: TEAL },
        },
      ],
    },
    true
  );
};

const renderDist = (distObj) => {
  const labels = STATUS_LABELS[props.domain] || {};
  const data = Object.entries(distObj || {}).map(([key, value]) => ({
    name: labels[key] || key,
    value,
  }));

  distChart.setOption(
    {
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "44%"],
          itemStyle: { borderRadius: 6 },
          label: { formatter: "{b}: {c}" },
          data,
          color: [PRIMARY, TEAL, "#ff7d00", "#f53f3f", "#d094ff"],
        },
      ],
    },
    true
  );
};

const renderTop = (topList) => {
  // 横向条形图：名称倒序（ECharts y 轴自下而上）
  const list = [...(topList || [])].reverse();

  topChart.setOption(
    {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 220, right: 56, top: 16, bottom: 32 },
      xAxis: { type: "value" },
      yAxis: {
        type: "category",
        data: list.map((item) => item.name),
        axisLabel: { width: 200, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          data: list.map((item) => item.value),
          itemStyle: { color: PRIMARY, borderRadius: [0, 3, 3, 0] },
          barMaxWidth: 16,
          label: { show: true, position: "right" },
        },
      ],
    },
    true
  );
};

onMounted(async () => {
  const url = isCommerce() ? "/api/analysis/sales" : "/api/analysis/learning";
  const res = await request({ method: "get", url });

  if (!res?.success) return;

  trendChart = echarts.init(trendRef.value);
  distChart = echarts.init(distRef.value);
  topChart = echarts.init(topRef.value);

  renderTrend(res.data.trend);
  renderDist(isCommerce() ? res.data.statusDist : res.data.statusDist);
  renderTop(isCommerce() ? res.data.topProducts : res.data.topCourses);

  onResize = () => {
    trendChart?.resize();
    distChart?.resize();
    topChart?.resize();
  };
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  trendChart?.dispose();
  distChart?.dispose();
  topChart?.dispose();
});
</script>

<style lang="less" scoped>
.analysis-view {
  .chart-card {
    padding: 16px 16px 8px;
    background-color: var(--color-bg-2);
    border-radius: 10px;

    .chart-title {
      margin-bottom: 8px;
      font-size: 14.5px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    .chart-body {
      height: 340px;
    }

    .chart-body-top {
      height: 380px;
    }
  }

  .second-row {
    margin-top: 16px;
  }
}
</style>
