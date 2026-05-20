<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">数据看板</div>
      <div class="page-subtitle">销售、客流、用户增长 · 多维度分析 · 15天趋势</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <button
          v-for="p in periods"
          :key="p.value"
          class="btn btn-sm"
          :class="{ 'btn-primary': period === p.value }"
          @click="switchPeriod(p.value)"
        >{{ p.label }}</button>
      </div>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">导出 Excel</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#x1F4C4;</div>
        <div class="stat-label">订单总数</div>
        <div class="stat-value">{{ currentData.orders.toLocaleString('zh-CN') }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ currentData.deltaOrders }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fa8c16;color:#fff">&#x1F4B0;</div>
        <div class="stat-label">总销售额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ currentData.sales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ currentData.deltaSales }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#x25F4;</div>
        <div class="stat-label">平均客单价</div>
        <div class="stat-value"><span class="unit">¥</span>{{ currentData.avg.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ currentData.deltaAvg }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#722ed1;color:#fff">&#x1F4C8;</div>
        <div class="stat-label">总客流量</div>
        <div class="stat-value">{{ currentData.flow.toLocaleString('zh-CN') }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ currentData.deltaFlow }}</span>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">销售趋势 (15天)</div></div>
        <div class="card-body">
          <div class="chart-bars">
            <div v-for="(v, i) in trendData.salesVals" :key="i" class="bar-col">
              <span class="bar-val">{{ v }}</span>
              <div class="bar" :style="{ height: (v / maxSales) * 180 + 'px', background: 'linear-gradient(180deg,#52c41a,#389e0d)' }"></div>
              <span class="bar-label">{{ trendData.days[i] }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">客流趋势 (15天)</div></div>
        <div class="card-body">
          <div class="chart-bars">
            <div v-for="(v, i) in trendData.flowVals" :key="i" class="bar-col">
              <span class="bar-val">{{ v }}</span>
              <div class="bar" :style="{ height: (v / maxFlow) * 180 + 'px' }"></div>
              <span class="bar-label">{{ trendData.days[i] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">用户增长趋势 (15天)</div><div class="card-extra">累计用户</div></div>
      <div class="card-body">
        <div class="chart-bars">
          <div v-for="(v, i) in trendData.userVals" :key="i" class="bar-col">
            <span class="bar-val">{{ v }}</span>
            <div class="bar" :style="{ height: ((v - 2650) / (2850 - 2650)) * 180 + 'px', background: 'linear-gradient(180deg,#52c41a,#389e0d)' }"></div>
            <span class="bar-label">{{ trendData.days[i] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">商户销售排行</div></div>
        <div class="card-body">
          <div v-for="s in shopRankings" :key="s.name" style="display:flex;align-items:center;gap:10px;padding:8px 0">
            <span style="width:90px;font-size:13px">{{ s.name }}</span>
            <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">
              <div style="height:100%;background:linear-gradient(90deg,#1677ff,#69b1ff)" :style="{ width: s.pct + '%' }"></div>
            </div>
            <span style="width:80px;text-align:right;font-weight:500;font-variant-numeric:tabular-nums">¥{{ s.val.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">用户活跃 24h 分布</div></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:3px;height:180px;padding:0 8px">
            <div
              v-for="h in 24"
              :key="h"
              :style="{
                flex: '1',
                height: heatmapHeights[h - 1] * 100 + '%',
                background: 'linear-gradient(180deg,#52c41a,#389e0d)',
                borderRadius: '2px 2px 0 0'
              }"
              :title="`${h - 1}时`"
            ></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ant-text-3);padding:4px 8px">
            <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>23时</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const period = ref('week')

const periods = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
]

const DATABOARD_DATA: Record<string, any> = {
  today:    { orders: 33,   sales: 1286.50,  avg: 38.98, flow: 128,  deltaOrders: '8%',  deltaSales: '12.5%', deltaAvg: '3.2%', deltaFlow: '15%' },
  week:     { orders: 198,  sales: 7820.00,  avg: 39.49, flow: 842,  deltaOrders: '5%',  deltaSales: '8.2%',  deltaAvg: '1.8%', deltaFlow: '12%' },
  month:    { orders: 856,  sales: 28560.50, avg: 33.36, flow: 3247, deltaOrders: '12%', deltaSales: '18%',   deltaAvg: '2.1%', deltaFlow: '10%' },
  quarter:  { orders: 2480, sales: 82100.00, avg: 33.10, flow: 9580, deltaOrders: '15%', deltaSales: '22%',   deltaAvg: '1.5%', deltaFlow: '18%' },
}

const DATABOARD_TRENDS: Record<string, any> = {
  today: {
    salesVals: [980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286],
    flowVals:  [68, 82, 95, 73, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 128],
    userVals:  [2780, 2792, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2837],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  week: {
    salesVals: [1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286, 1420, 1380, 1520, 1450, 1480],
    flowVals:  [95, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 142, 158, 148, 152],
    userVals:  [2795, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2838, 2840],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  month: {
    salesVals: [980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286],
    flowVals:  [68, 82, 95, 73, 128, 142, 128, 138, 109, 128, 142, 156, 128, 145, 128],
    userVals:  [2780, 2792, 2805, 2812, 2820, 2825, 2830, 2832, 2834, 2835, 2836, 2836, 2837, 2837, 2837],
    days:      ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15'],
  },
  quarter: {
    salesVals: [850, 920, 1100, 1050, 1280, 1150, 1320, 1450, 1380, 1520, 1480, 1680, 1550, 1720, 1650],
    flowVals:  [55, 68, 82, 72, 95, 88, 128, 142, 135, 156, 148, 168, 155, 178, 165],
    userVals:  [2650, 2670, 2700, 2720, 2740, 2760, 2780, 2795, 2810, 2820, 2830, 2835, 2840, 2845, 2850],
    days:      ['2/1','2/10','2/20','3/1','3/10','3/20','4/1','4/10','4/20','4/25','5/1','5/5','5/8','5/12','5/15'],
  },
}

const currentData = computed(() => DATABOARD_DATA[period.value] || DATABOARD_DATA.week)
const trendData = computed(() => DATABOARD_TRENDS[period.value] || DATABOARD_TRENDS.week)

const maxSales = computed(() => Math.max(...trendData.value.salesVals))
const maxFlow = computed(() => Math.max(...trendData.value.flowVals))

const shopRankings = ref([
  { name: '火车餐厅', val: 586, pct: 60 },
  { name: '树下咖啡', val: 400, pct: 42 },
  { name: '江夏火车厨', val: 230, pct: 25 },
  { name: '稻田鲜货铺', val: 70, pct: 8 },
  { name: '稻田手作坊', val: 0, pct: 0 },
])

const heatmapHeights = ref<number[]>([])

function generateHeatmap() {
  heatmapHeights.value = Array.from({ length: 24 }, (_, h) => {
    if (h < 6) return 0.1
    if (h < 11) return 0.3 + Math.random() * 0.3
    if (h < 14) return 0.7 + Math.random() * 0.3
    if (h < 17) return 0.5 + Math.random() * 0.3
    if (h < 21) return 0.6 + Math.random() * 0.4
    return 0.2
  })
}

function switchPeriod(p: string) {
  period.value = p
}

function handleExport() {
  alert('导出 Excel 中...')
}

onMounted(() => {
  generateHeatmap()
})
</script>

<style scoped>
.page { padding: 0; }
.stat-card .stat-icon {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.delta-up { color: var(--ant-success); }
.delta-down { color: var(--ant-error); }
</style>
