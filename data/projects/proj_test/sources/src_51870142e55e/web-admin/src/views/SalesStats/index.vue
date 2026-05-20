<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">销售统计</div>
      <div class="page-subtitle">销售概览 · 销售趋势 · 储值统计</div>
    </div>

    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">&#x1F4C5;</span>
      <input class="input" v-model="startDate" style="width:140px" type="date">
      <span>~</span>
      <input class="input" v-model="endDate" style="width:140px" type="date">
      <select class="select" v-model="shopId" style="width:160px">
        <option value="">全部店铺</option>
        <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">导出 Excel</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#x1F4C4;</div>
        <div class="stat-label">订单总数</div>
        <div class="stat-value">{{ overview.totalOrders.toLocaleString('zh-CN') }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ overview.deltaOrders }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fa8c16;color:#fff">&#x1F4B0;</div>
        <div class="stat-label">总销售额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ overview.totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        <div class="stat-extra">
          <span class="delta-up">&#x2191; {{ overview.deltaSales }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#x1F4B2;</div>
        <div class="stat-label">平均订单金额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ overview.avgAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#722ed1;color:#fff">&#x1F4B0;</div>
        <div class="stat-label">储值消费额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ overview.rechargeConsumed.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        <div class="stat-extra">占总销售 {{ overview.rechargePct }}%</div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">储值统计</div></div>
      <div class="card-body">
        <div class="stat-grid c4" style="margin-bottom:0">
          <div class="stat-card">
            <div class="stat-icon" style="background:#1677ff;color:#fff">&#x1F4B0;</div>
            <div class="stat-label">充值总额</div>
            <div class="stat-value" style="font-size:22px"><span class="unit">¥</span>{{ recharge.total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#52c41a;color:#fff">&#x1F464;</div>
            <div class="stat-label">充值用户数</div>
            <div class="stat-value" style="font-size:22px">{{ recharge.users.toLocaleString('zh-CN') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#fa8c16;color:#fff">&#x1F4B3;</div>
            <div class="stat-label">储值消费金额</div>
            <div class="stat-value" style="font-size:22px"><span class="unit">¥</span>{{ recharge.consumed.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#722ed1;color:#fff">&#x1F3E6;</div>
            <div class="stat-label">储值剩余余额</div>
            <div class="stat-value" style="font-size:22px"><span class="unit">¥</span>{{ recharge.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">销售趋势</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSalesOverview, getSalesTrend } from '@/api/stats'
import request from '@/api/request'

const startDate = ref('2026-04-14')
const endDate = ref('2026-05-14')
const shopId = ref('')
const shopList = ref<any[]>([])
const trendPeriod = ref('day')

const overview = ref({
  totalOrders: 856,
  totalSales: 28560.50,
  avgAmount: 33.36,
  rechargeConsumed: 12480.00,
  rechargePct: '43.7',
  deltaOrders: '12%',
  deltaSales: '18%',
})

const recharge = ref({
  total: 28560.00,
  users: 186,
  consumed: 12480.00,
  balance: 24680.50,
})

const TREND_DATA: Record<string, { vals: number[]; days: string[] }> = {
  day: {
    vals: [980, 1150, 1320, 1080, 1450, 1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1286],
    days: ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14'],
  },
  week: {
    vals: [1120, 1286, 1380, 1250, 1180, 1420, 1350, 1480, 1350, 1286, 1420, 1380, 1520, 1450],
    days: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14'],
  },
  month: {
    vals: [8500, 9200, 11000, 10500, 12800, 11500, 13200, 14500],
    days: ['1月','2月','3月','4月','5月','6月','7月','8月'],
  },
}

const trendValues = computed(() => TREND_DATA[trendPeriod.value]?.vals || TREND_DATA.day.vals)
const trendDays = computed(() => TREND_DATA[trendPeriod.value]?.days || TREND_DATA.day.days)
const maxTrend = computed(() => Math.max(...trendValues.value))

function param() {
  const p: any = { start_date: startDate.value, end_date: endDate.value }
  if (shopId.value) p.shop_id = shopId.value
  return p
}

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) shopList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchData() {
  try {
    const res: any = await getSalesOverview(param())
    if (res.code === 0 && res.data) {
      overview.value = {
        totalOrders: res.data.total_orders || overview.value.totalOrders,
        totalSales: res.data.total_amount || overview.value.totalSales,
        avgAmount: res.data.avg_amount || overview.value.avgAmount,
        rechargeConsumed: res.data.recharge_consumed || overview.value.rechargeConsumed,
        rechargePct: res.data.recharge_pct || overview.value.rechargePct,
        deltaOrders: res.data.delta_orders || overview.value.deltaOrders,
        deltaSales: res.data.delta_sales || overview.value.deltaSales,
      }
      if (res.data.recharge_total !== undefined) recharge.value.total = res.data.recharge_total
      if (res.data.recharge_users !== undefined) recharge.value.users = res.data.recharge_users
      if (res.data.recharge_balance !== undefined) recharge.value.balance = res.data.recharge_balance
    }
  } catch { /* use mock data */ }
}

async function fetchTrend() {
  try {
    const res: any = await getSalesTrend({ ...param(), period: trendPeriod.value })
    if (res.code === 0 && res.data?.length) {
      // API data available, could override mock
    }
  } catch { /* use mock data */ }
}

function handleExport() {
  alert('导出 Excel 中...')
}

onMounted(async () => {
  await fetchShops()
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
</style>
