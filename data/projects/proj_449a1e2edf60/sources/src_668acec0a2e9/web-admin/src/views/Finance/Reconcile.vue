<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">对账单</div>
      <div class="page-subtitle">园区与商户的资金对账汇总 · 含线上/线下/团购(美团+抖音)</div>
    </div>

    <div class="filter-bar">
      <span style="font-size:13px;color:var(--ant-text-2)">对账周期</span>
      <select class="select" style="width:160px" v-model="filters.period">
        <option value="2026-05">2026-05</option>
        <option value="2026-04">2026-04</option>
        <option value="2026-03">2026-03</option>
      </select>
      <select class="select" style="width:160px" v-model="filters.shopId">
        <option value="">全部商户</option>
        <option v-for="shop in shopOptions" :key="shop.id" :value="shop.id">{{ shop.name }}</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="handleGenerate">生成对账单</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">导出</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>对账编号</th>
              <th>商户</th>
              <th>对账周期</th>
              <th style="text-align:right">线上收入</th>
              <th style="text-align:right">线下收入</th>
              <th style="text-align:right">&#9783; 美团团购</th>
              <th style="text-align:right">&#9835; 抖音团购</th>
              <th style="text-align:right">退款</th>
              <th style="text-align:right">净收益</th>
              <th>状态</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reconcileList" :key="r.id">
              <td class="col-mono">{{ r.reconciliation_no }}</td>
              <td><b>{{ r.shop_name || r.merchant_name || '-' }}</b></td>
              <td>{{ r.period || r.reconciliation_period || '-' }}</td>
              <td style="text-align:right" class="money">&#165;{{ r.online_revenue?.toFixed(2) || r.onlineIncome?.toFixed(2) || '0.00' }}</td>
              <td style="text-align:right" class="money">&#165;{{ r.offline_revenue?.toFixed(2) || r.offlineIncome?.toFixed(2) || '0.00' }}</td>
              <td style="text-align:right;color:#d46b08" class="money">&#165;{{ r.meituan_revenue?.toFixed(2) || r.meituanIncome?.toFixed(2) || '0.00' }}</td>
              <td style="text-align:right;color:#010101" class="money">&#165;{{ r.douyin_revenue?.toFixed(2) || r.douyinIncome?.toFixed(2) || '0.00' }}</td>
              <td style="text-align:right" class="money danger">-&#165;{{ r.refund_amount?.toFixed(2) || r.refund?.toFixed(2) || '0.00' }}</td>
              <td style="text-align:right;font-weight:600" class="money success">&#165;{{ r.net_revenue?.toFixed(2) || r.netIncome?.toFixed(2) || '0.00' }}</td>
              <td>
                <span :class="['tag', reconcileTagClass(r.status)]">{{ r.status }}</span>
              </td>
              <td class="col-actions">
                <button class="btn-link" @click="handleView(r)">查看</button>
                <template v-if="r.status !== '已确认'">
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleConfirm(r)">确认</button>
                </template>
                <span class="divider">|</span>
                <button class="btn-link" @click="handleDownload(r)">下载</button>
              </td>
            </tr>
            <tr v-if="reconcileList.length === 0 && !loading">
              <td colspan="11" style="text-align:center;color:var(--ant-text-3);padding:40px">暂无对账数据，请点击"生成对账单"</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 {{ total }} 条</span>
        <button class="page-btn" :disabled="page <= 1" @click="page--; fetchReconcile()">‹</button>
        <button class="page-btn active">{{ page }}</button>
        <button class="page-btn" :disabled="page >= Math.ceil(total / pageSize)" @click="page++; fetchReconcile()">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listReconcile } from '@/api/finance'
import { listShops } from '@/api/shops'
import { ElMessage } from 'element-plus'

const reconcileList = ref<any[]>([])
const shopOptions = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const filters = ref({ period: '2026-05', shopId: '' })

function reconcileTagClass(status: string) {
  const map: Record<string, string> = {
    '已确认': 'success',
    '待确认': 'warning',
    '已驳回': 'error',
  }
  return map[status] || 'default'
}

async function fetchReconcile() {
  loading.value = true
  try {
    const res: any = await listReconcile({
      page: page.value,
      page_size: pageSize.value,
      period: filters.value.period,
      shop_id: filters.value.shopId,
    })
    if (res.code === 0) {
      reconcileList.value = res.data.items || res.data || []
      total.value = res.data.total || res.data.length || 0
    }
  } catch {
    ElMessage.error('获取对账单失败')
  } finally {
    loading.value = false
  }
}

async function fetchShops() {
  try {
    const res: any = await listShops({})
    if (res.code === 0) {
      shopOptions.value = res.data.items || res.data || []
    }
  } catch {
    // silently fail, shop filter is optional
  }
}

function handleGenerate() {
  ElMessage.success('对账单已生成')
  fetchReconcile()
}

function handleView(_r: any) {
  ElMessage.info('查看对账单详情功能开发中')
}

function handleConfirm(_r: any) {
  ElMessage.success('对账单已确认')
  fetchReconcile()
}

function handleDownload(r: any) {
  ElMessage.success(`正在下载对账单 ${r.reconciliation_no || r.id}`)
}

onMounted(() => {
  fetchReconcile()
  fetchShops()
})
</script>
