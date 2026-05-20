<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">客流统计</div>
      <div class="page-subtitle">客流数据来源于闸机扫码 / 人脸通行自动采集</div>
    </div>

    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">&#x1F4C5;</span>
      <input class="input" v-model="startDate" style="width:140px" type="date">
      <span>~</span>
      <input class="input" v-model="endDate" style="width:140px" type="date">
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">导出</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#x26EC;</div>
        <div class="stat-label">今日客流</div>
        <div class="stat-value">{{ overview.todayFlow.toLocaleString('zh-CN') }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ overview.todayDelta }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#x1F4C8;</div>
        <div class="stat-label">本周客流</div>
        <div class="stat-value">{{ overview.weekFlow.toLocaleString('zh-CN') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#722ed1;color:#fff">&#x1F465;</div>
        <div class="stat-label">本月客流</div>
        <div class="stat-value">{{ overview.monthFlow.toLocaleString('zh-CN') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fa8c16;color:#fff">&#x1F4CA;</div>
        <div class="stat-label">同比变化</div>
        <div class="stat-value">{{ overview.yoyChange }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">客流趋势</div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-xs" :class="{ 'btn-primary': trendPeriod === 'day' }" @click="trendPeriod = 'day'; fetchTrend()">按日</button>
          <button class="btn btn-xs" :class="{ 'btn-primary': trendPeriod === 'week' }" @click="trendPeriod = 'week'; fetchTrend()">按周</button>
          <button class="btn btn-xs" :class="{ 'btn-primary': trendPeriod === 'month' }" @click="trendPeriod = 'month'; fetchTrend()">按月</button>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-bars">
          <div v-for="(v, i) in trendValues" :key="i" class="bar-col">
            <span class="bar-val">{{ v }}</span>
            <div class="bar" :style="{ height: maxTrend > 0 ? (v / maxTrend) * 180 + 'px' : '10px', background: 'linear-gradient(180deg,#52c41a,#389e0d)' }"></div>
            <span class="bar-label">{{ trendDays[i] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-head"><div class="card-title">24h 高峰时段分布</div></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:3px;height:160px">
            <div
              v-for="h in 24"
              :key="h"
              :style="{
                flex: '1',
                height: heatmapHeights[h - 1] * 100 + '%',
                background: 'linear-gradient(180deg,#1677ff,#0958d9)',
                borderRadius: '2px 2px 0 0'
              }"
              :title="`${h - 1}时 · ${Math.round(heatmapHeights[h - 1] * 30)}人`"
            ></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ant-text-3);margin-top:6px">
            <span>0时</span><span>6时</span><span>12时</span><span>18时</span><span>23时</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">客流详情</div></div>
        <table class="ant-table">
          <thead><tr><th>时段</th><th>入园</th><th>出园</th><th>在园</th></tr></thead>
          <tbody>
            <tr v-for="row in flowDetails" :key="row.time">
              <td>{{ row.time }}</td>
              <td>{{ row.in_count }}</td>
              <td>{{ row.out_count }}</td>
              <td>{{ row.in_park }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getFlowOverview, getFlowTrend, getFlowHeatmap } from '@/api/stats'

const startDate = ref('2026-04-14')
const endDate = ref('2026-05-14')
const trendPeriod = ref('day')

const overview = ref({
  todayFlow: 128,
  weekFlow: 842,
  monthFlow: 3247,
  yoyChange: '+18%',
  todayDelta: '15%',
})

const flowDetails = ref([
  { time: '2026-05-14 14:00', in_count: 12, out_count: 8, in_park: 86 },
  { time: '2026-05-14 13:00', in_count: 18, out_count: 5, in_park: 82 },
  { time: '2026-05-14 12:00', in_count: 25, out_count: 15, in_park: 69 },
  { time: '2026-05-14 11:00', in_count: 20, out_count: 4, in_park: 59 },
])

const TREND_DATA: Record<string, { vals: number[]; days: string[] }> = {
  day: {
    vals: [68, 82, 95, 73, 128, 142, 156, 138, 109, 128, 142, 156, 128, 128],
    days: ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14'],
  },
  week: {
    vals: [420, 510, 480, 560, 620, 580, 842],
    days: ['W1','W2','W3','W4','W5','W6','W7'],
  },
  month: {
    vals: [2800, 3100, 2950, 3247],
    days: ['1月','2月','3月','4月'],
  },
}

const trendValues = computed(() => TREND_DATA[trendPeriod.value]?.vals || TREND_DATA.day.vals)
const trendDays = computed(() => TREND_DATA[trendPeriod.value]?.days || TREND_DATA.day.days)
const maxTrend = computed(() => Math.max(...trendValues.value))

const heatmapHeights = ref<number[]>([])

function generateHeatmap() {
  heatmapHeights.value = Array.from({ length: 24 }, (_, h) => {
    if (h < 6) return 0.05
    if (h < 9) return 0.15
    if (h < 11) return 0.4
    if (h < 14) return 0.85
    if (h < 17) return 0.55
    if (h < 20) return 0.92
    if (h < 22) return 0.5
    return 0.15
  })
}

function param() {
  return { start_date: startDate.value, end_date: endDate.value }
}

async function fetchData() {
  try {
    const res: any = await getFlowOverview(param())
    if (res.code === 0 && res.data) {
      overview.value = {
        todayFlow: res.data.today_flow ?? overview.value.todayFlow,
        weekFlow: res.data.week_flow ?? overview.value.weekFlow,
        monthFlow: res.data.month_flow ?? overview.value.monthFlow,
        yoyChange: res.data.yoy_change ?? overview.value.yoyChange,
        todayDelta: res.data.today_delta ?? overview.value.todayDelta,
      }
      if (res.data.details) flowDetails.value = res.data.details
    }
  } catch { /* use mock data */ }
}

async function fetchTrend() {
  try {
    const res: any = await getFlowTrend({ ...param(), period: trendPeriod.value })
    if (res.code === 0 && res.data?.length) {
      // API data available
    }
  } catch { /* use mock data */ }
}

function handleExport() {
  alert('导出中...')
}

onMounted(async () => {
  generateHeatmap()
  await fetchData()
  await fetchTrend()
})
</script>

<style scoped>
.stat-card .stat-icon {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.delta-up { color: var(--ant-success); }
.delta-down { color: var(--ant-error); }
</style>
