<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">抖音结算明细</div>
      <div class="page-subtitle">抖音生活服务平台 &#183; T+1 结算周期 &#183; 平台服务费率 5%</div>
    </div>

    <div class="filter-bar">
      <select class="select" v-model="filters.month">
        <option>2026-05</option>
        <option>2026-04</option>
        <option>2026-03</option>
      </select>
      <select class="select" v-model="filters.shopId">
        <option :value="null">全部店铺</option>
        <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <select class="select" v-model="filters.status">
        <option>全部状态</option>
        <option>待结算</option>
        <option>已结算</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">&#9660; 导出对账单</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-label">本月结算总额</div>
        <div class="stat-value" style="color:#010101">&#165;{{ stats.totalSettlement?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#f5f5f5;color:#010101">&#165;</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平台服务费</div>
        <div class="stat-value" style="color:#ff4d4f">&#165;{{ stats.serviceFee?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#fff2f0;color:#ff4d4f">&#165;</div>
        <div class="stat-extra">费率 5%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">净收入</div>
        <div class="stat-value" style="color:#52c41a">&#165;{{ stats.netIncome?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#f6ffed;color:#52c41a">&#165;</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待结算</div>
        <div class="stat-value" style="color:#faad14">&#165;{{ stats.pendingAmount?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#fffbe6;color:#faad14">&#8987;</div>
        <div class="stat-extra">{{ stats.pendingCount || 0 }} 笔</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>结算单号</th>
                <th>店铺</th>
                <th>结算日期</th>
                <th style="text-align:right">订单数</th>
                <th style="text-align:right">总额</th>
                <th style="text-align:right">服务费 (5%)</th>
                <th style="text-align:right">净额</th>
                <th>结算周期</th>
                <th>状态</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in settlements" :key="s.batch_no">
                <td class="col-mono">{{ s.batch_no }}</td>
                <td><b>{{ s.shop_name || s.shop?.name || '-' }}</b></td>
                <td>{{ s.settlement_date || s.settle_date }}</td>
                <td style="text-align:right">{{ s.order_count || s.verify_count || 0 }}</td>
                <td style="text-align:right;font-weight:600" class="money">&#165;{{ s.total_amount?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;color:var(--ant-error)" class="money">-&#165;{{ s.service_fee?.toFixed(2) || s.commission_total?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;font-weight:600;color:var(--ant-success)" class="money">&#165;{{ s.net_amount?.toFixed(2) || s.settlement_amount?.toFixed(2) || '0.00' }}</td>
                <td>{{ s.period || '-' }}</td>
                <td>
                  <span :class="'tag ' + (s.status === '已结算' || s.status === '已打款' ? 'success' : 'warning')">{{ s.status }}</span>
                </td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleViewDetail(s)">查看明细</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleDownload(s)">下载</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">本月结算趋势</div></div>
      <div class="card-body">
        <div class="chart-bars">
          <div class="bar-col" v-for="(v, i) in settlementTrend" :key="i">
            <span class="bar-val">{{ v }}</span>
            <div class="bar" :style="{ height: (v / maxBar) * 180 + 'px', background: 'linear-gradient(180deg, #010101, #333)' }"></div>
            <span class="bar-label">5/{{ i + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const settlements = ref<any[]>([])
const loading = ref(false)
const shopList = ref<any[]>([])
const stats = ref<any>({})

const filters = reactive({
  month: '2026-05',
  shopId: null as number | null,
  status: '全部状态',
})

const settlementTrend = ref<number[]>([180, 260, 320, 240, 290, 380, 450, 390, 480, 420, 550, 620, 680, 520])
const maxBar = 700

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) shopList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchStats() {
  try {
    const res: any = await request.get('/douyin/settlement-stats')
    if (res.code === 0) stats.value = res.data || {}
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: 1, page_size: 50 }
    if (filters.shopId) params.shop_id = filters.shopId
    if (filters.status !== '全部状态') params.status = filters.status
    if (filters.month) params.month = filters.month
    const res: any = await request.get('/douyin/settlements', { params })
    if (res.code === 0) settlements.value = res.data.items || res.data || []
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleExport() {
  alert('导出对账单中...')
}

function handleViewDetail(row: any) {
  alert('查看结算单 ' + row.batch_no + ' 明细')
}

function handleDownload(row: any) {
  alert('下载结算单 ' + row.batch_no)
}

onMounted(async () => { await fetchShops(); await fetchStats(); await fetchData() })
</script>
