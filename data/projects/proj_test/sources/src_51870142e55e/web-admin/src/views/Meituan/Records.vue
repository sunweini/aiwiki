<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">验券记录</div>
      <div class="page-subtitle">美团/大众点评团购券核销记录 . 支持撤销验券与码查询</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <input class="input" v-model="filters.keyword" placeholder="券码 / 核销单号" style="width:200px">
      </div>
      <div class="filter-item">
        <select class="select" v-model="filters.status">
          <option value="">全部状态</option>
          <option value="已核销">已核销</option>
          <option value="已撤销">已撤销</option>
        </select>
      </div>
      <div class="filter-item">
        <select class="select" v-model="filters.shopId">
          <option value="">全部店铺</option>
          <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="filter-item">
        <input class="input" v-model="filters.startDate" type="date" placeholder="开始日期" style="width:140px">
      </div>
      <div class="filter-item">~</div>
      <div class="filter-item">
        <input class="input" v-model="filters.endDate" type="date" placeholder="结束日期" style="width:140px">
      </div>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        导出
      </button>
      <button class="btn btn-primary" @click="handleCodeQuery">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        验券码查询
      </button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#f6ffed;color:#52c41a">✓</div>
        <div class="stat-label">今日核销</div>
        <div class="stat-value">{{ stats.todayCount }}<span class="unit" style="margin-left:4px;margin-right:0">笔</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-primary-bg);color:var(--ant-primary)">¥</div>
        <div class="stat-label">核销金额</div>
        <div class="stat-value"><span class="unit">¥</span>{{ stats.todayAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-error-bg);color:var(--ant-error)">⤺</div>
        <div class="stat-label">撤销/退款</div>
        <div class="stat-value">{{ stats.revokeCount }}<span class="unit" style="margin-left:4px;margin-right:0">笔</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--ant-warning-bg);color:#faad14">⏳</div>
        <div class="stat-label">可撤销 (24h内)</div>
        <div class="stat-value">{{ stats.refundableCount }}<span class="unit" style="margin-left:4px;margin-right:0">笔</span></div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>核销单号</th><th>美团券码</th><th>团购商品</th><th style="text-align:right">原价</th><th style="text-align:right">售价</th>
              <th>用户</th><th>店铺</th><th>状态</th><th>核销人</th><th>核销时间</th><th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr><td colspan="11" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td></tr>
            </template>
            <template v-else-if="records.length === 0">
              <tr><td colspan="11" style="text-align:center;padding:40px;color:var(--ant-text-3)">暂无数据</td></tr>
            </template>
            <template v-else>
              <tr v-for="row in records" :key="row.verify_no || row.id">
                <td class="col-mono">{{ row.verify_no || row.batch_no || row.id || '-' }}</td>
                <td class="col-mono">{{ row.coupon_code || row.meituan_coupon_code || '-' }}</td>
                <td><b>{{ row.coupon_name || row.product || '-' }}</b></td>
                <td style="text-align:right;text-decoration:line-through;color:var(--ant-text-3)" class="money">¥{{ (row.origin_price ?? row.original_price ?? 0).toFixed(2) }}</td>
                <td style="text-align:right;font-weight:600;color:var(--ant-error)" class="money">¥{{ (row.amount ?? row.sale_price ?? 0).toFixed(2) }}</td>
                <td>{{ row.user_phone || row.user || '-' }}</td>
                <td>{{ row.shop?.name || row.shop || '-' }}</td>
                <td>
                  <span class="tag success" v-if="row.status === '已核销'">已核销</span>
                  <span class="tag error" v-else-if="row.status === '已撤销'">已撤销</span>
                  <span class="tag default" v-else>{{ row.status || '-' }}</span>
                </td>
                <td>{{ row.operator?.real_name || row.verify_by || '-' }}</td>
                <td>{{ row.verified_at || row.verify_at || '-' }}</td>
                <td class="col-actions">
                  <template v-if="row.status === '已核销' && row.refundable">
                    <button class="btn-link" @click="handleRevoke(row)">撤销验券</button>
                    <span class="divider">|</span>
                  </template>
                  <button class="btn-link" @click="handleDetail(row)">详情</button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 {{ total }} 条</span>
        <button class="page-btn" :disabled="page <= 1" @click="page--; fetchData">上一页</button>
        <button class="page-btn" v-for="p in visiblePages" :key="p" :class="{ active: p === page }" @click="page = p; fetchData">{{ p }}</button>
        <button class="page-btn" :disabled="page >= totalPages" @click="page++; fetchData">下一页</button>
      </div>
    </div>

    <!-- 撤销确认 Modal -->
    <div class="modal-mask" :class="{ open: showRevokeModal }" @click.self="showRevokeModal = false">
      <div class="modal">
        <div class="modal-head">
          撤销验券确认
          <button class="close-btn" @click="showRevokeModal = false">×</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--ant-warning-bg);border:1px solid var(--ant-warning-border);border-radius:8px;padding:14px;margin-bottom:18px">
            <div style="font-size:14px;font-weight:500;color:#d48806">⚠️ 撤销验券操作不可逆</div>
            <div style="font-size:12px;color:#d48806;margin-top:4px">撤销后用户将恢复券码可用状态，可在有效期内重新核销</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销单号</div><div class="col-mono">{{ revokeTarget.verify_no || revokeTarget.batch_no }}</div></div>
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">美团券码</div><div class="col-mono">{{ revokeTarget.coupon_code || revokeTarget.meituan_coupon_code }}</div></div>
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">团购商品</div><div><b>{{ revokeTarget.coupon_name || revokeTarget.product }}</b></div></div>
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销金额</div><div style="font-size:22px;font-weight:600;color:var(--ant-error)" class="money">¥{{ (revokeTarget.amount ?? revokeTarget.settlement_amount ?? 0).toFixed(2) }}</div></div>
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">店铺</div><div>{{ revokeTarget.shop?.name || revokeTarget.shop }}</div></div>
            <div><div style="color:var(--ant-text-3);margin-bottom:4px">核销时间</div><div>{{ revokeTarget.verified_at || revokeTarget.verify_at }}</div></div>
          </div>
          <div class="form-item" style="margin-top:18px">
            <label class="form-label">撤销原因</label>
            <textarea class="textarea" v-model="revokeReason" rows="2" placeholder="请输入撤销原因（必填）"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showRevokeModal = false">取消</button>
          <button class="btn btn-danger solid" @click="confirmRevoke" :disabled="!revokeReason.trim()">确认撤销</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const records = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const shopList = ref<any[]>([])

const filters = reactive({
  keyword: '',
  status: '',
  shopId: null as number | null,
  startDate: '',
  endDate: '',
})

const stats = reactive({
  todayCount: 0,
  todayAmount: 0,
  revokeCount: 0,
  refundableCount: 0,
})

// 撤销相关
const showRevokeModal = ref(false)
const revokeTarget = ref<any>({})
const revokeReason = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const visiblePages = computed(() => {
  const pages: number[] = []
  const t = totalPages.value
  const start = Math.max(1, page.value - 2)
  const end = Math.min(t, page.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) shopList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, page_size: pageSize.value }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.shopId) params.shop_id = filters.shopId
    if (filters.startDate) params.start_date = filters.startDate
    if (filters.endDate) params.end_date = filters.endDate
    const res: any = await request.get('/meituan/records', { params })
    if (res.code === 0) {
      records.value = res.data.items || []
      total.value = res.data.total || 0
    }
    // compute stats from returned data
    computeStats()
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function computeStats() {
  const data = records.value
  const today = new Date().toISOString().slice(0, 10)
  stats.todayCount = data.filter((r: any) => (r.verified_at || r.verify_at || '').includes(today)).length
  stats.todayAmount = data
    .filter((r: any) => (r.verified_at || r.verify_at || '').includes(today))
    .reduce((s: number, r: any) => s + (r.amount ?? r.settlement_amount ?? 0), 0)
  stats.revokeCount = data.filter((r: any) => r.status === '已撤销').length
  stats.refundableCount = data.filter((r: any) => r.status === '已核销' && r.refundable !== false).length
}

function handleExport() {
  ElMessage.info('导出功能开发中')
}

function handleCodeQuery() {
  ElMessage.info('验券码查询：请输入12位券码')
}

function handleRevoke(row: any) {
  revokeTarget.value = row
  revokeReason.value = ''
  showRevokeModal.value = true
}

async function confirmRevoke() {
  if (!revokeReason.value.trim()) return
  try {
    const res: any = await request.post(`/meituan/records/${revokeTarget.value.verify_no || revokeTarget.value.id}/revoke`, {
      reason: revokeReason.value,
    })
    if (res.code === 0) {
      ElMessage.success('验券已撤销')
      showRevokeModal.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '撤销失败')
    }
  } catch {
    ElMessage.error('撤销失败')
  }
}

function handleDetail(row: any) {
  ElMessage.info('查看详情: ' + (row.verify_no || row.batch_no || row.id))
}

onMounted(async () => { await fetchShops(); await fetchData() })
</script>
