<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">结算明细</div>
      <div class="page-subtitle">美团平台团购订单结算明细与对账 . 按 T+1 周期结算</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <select class="select" v-model="filters.month" style="width:140px">
          <option v-for="m in monthOptions" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="filter-item">
        <select class="select" v-model="filters.shopId">
          <option value="">全部店铺</option>
          <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="filter-item">
        <select class="select" v-model="filters.status" style="width:130px">
          <option value="">全部状态</option>
          <option value="待结算">待结算</option>
          <option value="已结算">已结算</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        导出对账单
      </button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-primary-bg);color:var(--ant-primary)">¥</div>
        <div class="stat-label">本月结算总额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ stats.totalAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-warning-bg);color:#fa8c16">¥</div>
        <div class="stat-label">平台佣金</div>
        <div class="stat-value"><span class="unit">¥</span>{{ stats.commission.toFixed(2) }}</div>
        <div class="stat-extra">费率 10%</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-success-bg);color:#52c41a">¥</div>
        <div class="stat-label">净收入</div>
        <div class="stat-value"><span class="unit">¥</span>{{ stats.netIncome.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-warning-bg);color:#faad14">⏳</div>
        <div class="stat-label">待结算</div>
        <div class="stat-value"><span class="unit">¥</span>{{ stats.pendingAmount.toFixed(2) }}</div>
        <div class="stat-extra">{{ stats.pendingCount }} 笔</div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>结算单号</th><th>店铺</th><th>结算日期</th><th style="text-align:right">订单数</th>
              <th style="text-align:right">总额</th><th style="text-align:right">佣金 (10%)</th><th style="text-align:right">净额</th>
              <th>结算周期</th><th>状态</th><th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr><td colspan="10" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td></tr>
            </template>
            <template v-else-if="settlements.length === 0">
              <tr><td colspan="10" style="text-align:center;padding:40px;color:var(--ant-text-3)">暂无数据</td></tr>
            </template>
            <template v-else>
              <tr v-for="row in settlements" :key="row.batch_no || row.id">
                <td class="col-mono">{{ row.batch_no || row.settlement_no || row.id || '-' }}</td>
                <td><b>{{ row.shop?.name || row.shop || '-' }}</b></td>
                <td>{{ row.settlement_date || row.settle_date || row.settleDate || '-' }}</td>
                <td style="text-align:right">{{ row.verify_count ?? row.order_count ?? row.orderCount ?? '-' }}</td>
                <td style="text-align:right;font-weight:600" class="money">¥{{ (row.verify_total ?? row.total_amount ?? 0).toFixed(2) }}</td>
                <td style="text-align:right;color:var(--ant-error)" class="money">-¥{{ (row.commission_total ?? row.commission ?? 0).toFixed(2) }}</td>
                <td style="text-align:right;font-weight:600;color:var(--ant-success)" class="money">¥{{ (row.settlement_amount ?? row.net_amount ?? 0).toFixed(2) }}</td>
                <td>T+1</td>
                <td>
                  <span class="tag success" v-if="row.status === '已结算' || row.status === '已打款'">{{ row.status }}</span>
                  <span class="tag warning" v-else>{{ row.status || '待结算' }}</span>
                </td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleViewDetail(row)">查看明细</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleDownload(row)">下载</button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="card-title">本月结算趋势</div></div>
      <div class="card-body">
        <div class="chart-bars">
          <div class="bar-col" v-for="(val, idx) in trendData" :key="idx">
            <span class="bar-val">{{ val }}</span>
            <div class="bar" :style="{ height: (val / trendMax) * 180 + 'px', background: 'linear-gradient(180deg, #13c2c2, #08979c)' }"></div>
            <span class="bar-label">{{ trendLabels[idx] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const settlements = ref<any[]>([])
const loading = ref(false)
const shopList = ref<any[]>([])

// Generate month options from current month back 12 months
const now = new Date()
const monthOptions = ref<string[]>([])
for (let i = 0; i < 12; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
  monthOptions.value.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}

const filters = reactive({
  month: monthOptions.value[0],
  shopId: null as number | null,
  status: '',
})

const stats = reactive({
  totalAmount: 0,
  commission: 0,
  netIncome: 0,
  pendingAmount: 0,
  pendingCount: 0,
})

// Trend chart data (cyan gradient bars matching prototype)
const trendData = ref<number[]>([120, 185, 220, 158, 198, 280, 310, 268, 340, 290, 380, 420, 450, 386])
const trendMax = ref(500)
const trendLabels = ref<string[]>(Array.from({ length: 14 }, (_, i) => `5/${i + 1}`))

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) {
      shopList.value = res.data?.items || []
    }
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: 1, page_size: 50 }
    if (filters.shopId) params.shop_id = filters.shopId
    if (filters.status) params.status = filters.status
    if (filters.month) params.month = filters.month
    const res: any = await request.get('/meituan/settlements', { params })
    if (res.code === 0) {
      settlements.value = res.data.items || res.data || []
    }
    computeStats()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function computeStats() {
  const data = settlements.value
  stats.totalAmount = data.reduce((s: number, r: any) => s + (r.verify_total ?? r.total_amount ?? 0), 0)
  stats.commission = data.reduce((s: number, r: any) => s + (r.commission_total ?? r.commission ?? 0), 0)
  stats.netIncome = data.reduce((s: number, r: any) => s + (r.settlement_amount ?? r.net_amount ?? 0), 0)
  const pending = data.filter((r: any) => r.status !== '已结算' && r.status !== '已打款')
  stats.pendingAmount = pending.reduce((s: number, r: any) => s + (r.settlement_amount ?? r.net_amount ?? 0), 0)
  stats.pendingCount = pending.length
}

function handleExport() {
  ElMessage.info('导出对账单中...')
}

function handleViewDetail(row: any) {
  ElMessage.info('查看结算明细: ' + (row.batch_no || row.settlement_no))
}

function handleDownload(row: any) {
  ElMessage.info('下载结算单: ' + (row.batch_no || row.settlement_no))
}

onMounted(async () => { await fetchShops(); await fetchData() })
</script>
