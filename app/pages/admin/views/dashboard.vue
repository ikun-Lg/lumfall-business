<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-row">
      <a-col v-for="stat in statCards" :key="stat.label" :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 图表 -->
    <a-row :gutter="16" class="chart-row">
      <a-col :xs="24" :lg="16">
        <div class="chart-card">
          <div class="chart-title">近 7 日订单与销售额</div>
          <div ref="trendRef" class="chart-body"></div>
        </div>
      </a-col>
      <a-col :xs="24" :lg="8">
        <div class="chart-card">
          <div class="chart-title">商品分类占比</div>
          <div ref="pieRef" class="chart-body"></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { request } from "../../common/auth";

const trendRef = ref(null);
const pieRef = ref(null);
const stats = ref({});
const statCards = ref([]);

const PRIMARY = "#165dff";

let trendChart = null;
let pieChart = null;
let onResize = null;

const renderCharts = (trends, categories) => {
  if (trendRef.value) {
    trendChart = echarts.init(trendRef.value);
    trendChart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["订单量", "销售额"], bottom: 0 },
      grid: { left: 48, right: 56, top: 32, bottom: 48 },
      xAxis: { type: "category", data: trends.dates, boundaryGap: false },
      yAxis: [
        { type: "value", name: "订单量" },
        { type: "value", name: "销售额", splitLine: { show: false } },
      ],
      series: [
        {
          name: "订单量",
          type: "line",
          smooth: true,
          yAxisIndex: 0,
          data: trends.orders,
          areaStyle: { opacity: 0.12 },
          itemStyle: { color: PRIMARY },
        },
        {
          name: "销售额",
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: trends.sales,
          areaStyle: { opacity: 0.08 },
          itemStyle: { color: "#14c9c9" },
        },
      ],
    });
  }

  if (pieRef.value) {
    pieChart = echarts.init(pieRef.value);
    pieChart.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "44%"],
          itemStyle: { borderRadius: 6 },
          label: { formatter: "{b}: {c}" },
          data: categories,
          color: [PRIMARY, "#14c9c9", "#ff7d00"],
        },
      ],
    });
  }
};

onMounted(async () => {
  const [statsRes, trendRes] = await Promise.all([
    request({ method: "get", url: "/api/dashboard/stats" }),
    request({ method: "get", url: "/api/dashboard/trends" }),
  ]);

  if (statsRes?.success) {
    stats.value = statsRes.data;
    statCards.value = [
      { label: "今日订单", value: stats.value.todayOrders, icon: "IconFile", bg: "rgba(22,93,255,.12)" },
      { label: "今日销售额", value: `¥ ${stats.value.todaySales}`, icon: "IconTrendingUp", bg: "rgba(0,180,42,.12)" },
      { label: "用户总数", value: stats.value.userCount, icon: "IconUserGroup", bg: "rgba(255,125,0,.14)" },
      { label: "今日访问", value: stats.value.visitCount, icon: "IconEye", bg: "rgba(208,148,255,.16)" },
    ];
  }

  if (trendRes?.success) {
    renderCharts(trendRes.data.trends, trendRes.data.categories);
    onResize = () => {
      trendChart?.resize();
      pieChart?.resize();
    };
    window.addEventListener("resize", onResize);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>

<style lang="less" scoped>
.dashboard-page {
  .stat-row {
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background-color: var(--color-bg-2);
      border-radius: 10px;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      }

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        border-radius: 10px;
        font-size: 22px;
        color: var(--color-text-1);
      }

      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-1);
        line-height: 1.2;
      }

      .stat-label {
        margin-top: 2px;
        font-size: 12.5px;
        color: var(--color-text-3);
      }
    }
  }

  .chart-row {
    margin-top: 16px;

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
        height: 320px;
      }
    }
  }
}
</style>
