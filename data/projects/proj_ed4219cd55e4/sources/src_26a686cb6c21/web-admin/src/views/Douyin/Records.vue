<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">抖音验券记录</div>
      <div class="page-subtitle">团购套餐 &#183; 次卡 &#183; 代金券 &#183; 组合券包 &#183; 核销记录与撤销管理</div>
    </div>

    <div class="filter-bar">
      <input class="input" v-model="filters.keyword" placeholder="券码 / 核销单号" style="width:200px">
      <select class="select" v-model="filters.couponType">
        <option>全部类型</option>
        <option>团购套餐</option>
        <option>代金券</option>
        <option>次卡</option>
        <option>组合券包</option>
      </select>
      <select class="select" v-model="filters.status">
        <option>全部状态</option>
        <option>已核销</option>
        <option>部分核销</option>
        <option>已撤销</option>
      </select>
      <select class="select" v-model="filters.shopId">
        <option :value="null">全部店铺</option>
        <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <input class="input" v-model="filters.startDate" placeholder="开始日期" style="width:140px" type="date">
      <span>~</span>
      <input class="input" v-model="filters.endDate" placeholder="结束日期" style="width:140px" type="date">
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm" @click="handleExport">&#9660; 导出</button>
      <button class="btn btn-primary" @click="showCouponSearch">&#128269; 券码查询</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-label">今日核销</div>
        <div class="stat-value"><span class="unit">笔</span>{{ stats.todayVerify || 0 }}</div>
        <div class="stat-icon" style="background:#f6ffed;color:#52c41a">&#10003;</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">核销金额</div>
        <div class="stat-value" style="color:#010101">&#165;{{ stats.todayAmount?.toFixed(2) || '0.00' }}</div>
        <div class="stat-icon" style="background:#f5f5f5;color:#010101">&#165;</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">次卡剩余</div>
        <div class="stat-value"><span class="unit">次</span>{{ stats.remainingTimes || 0 }}</div>
        <div class="stat-icon" style="background:#e6f4ff;color:#1677ff">&#9672;</div>
        <div class="stat-extra">1 张次卡进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可撤销 (24h内)</div>
        <div class="stat-value"><span class="unit">笔</span>{{ stats.revocable || 0 }}</div>
        <div class="stat-icon" style="background:#fffbe6;color:#faad14">&#8987;</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>核销单号</th>
                <th>券码</th>
                <th>券类型</th>
                <th>团购商品</th>
                <th style="text-align:right">原价</th>
                <th style="text-align:right">售价</th>
                <th>用户</th>
                <th>店铺</th>
                <th style="text-align:center">核销进度</th>
                <th>状态</th>
                <th>核销人</th>
                <th>核销时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in records" :key="r.verify_no">
                <td class="col-mono">{{ r.verify_no }}</td>
                <td class="col-mono">{{ r.coupon_code || '-' }}</td>
                <td>
                  <span :class="'tag ' + couponTypeTag(r.coupon_type)">{{ r.coupon_type || '团购套餐' }}</span>
                </td>
                <td><b>{{ r.coupon_name }}</b></td>
                <td style="text-align:right;text-decoration:line-through;color:var(--ant-text-3)" class="money">&#165;{{ r.origin_price?.toFixed(2) || '0.00' }}</td>
                <td style="text-align:right;font-weight:600;color:var(--ant-error)" class="money">&#165;{{ r.amount?.toFixed(2) || '0.00' }}</td>
                <td>{{ r.user_name || '-' }}<br><span style="font-size:12px;color:var(--ant-text-3)">{{ r.user_phone || '' }}</span></td>
                <td>{{ r.shop_name || '-' }}</td>
                <td style="text-align:center">
                  <span style="font-weight:600">{{ r.verify_count || 1 }}/{{ r.max_count || 1 }}</span> 次
                </td>
                <td>
                  <span :class="'tag ' + statusTag(r.status)">{{ r.status || '已核销' }}</span>
                </td>
                <td>{{ r.operator?.real_name || '-' }}</td>
                <td>{{ r.verified_at }}</td>
                <td class="col-actions">
                  <template v-if="r.status === '已核销' && r.refundable">
                    <button class="btn-link" @click="handleRevoke(r.verify_no)">撤销验券</button>
                    <span class="divider">|</span>
                  </template>
                  <template v-if="r.status === '部分核销'">
                    <button class="btn-link" @click="handleContinueVerify(r)">继续核销</button>
                    <span class="divider">|</span>
                  </template>
                  <button class="btn-link" @click="handleDetail(r)">详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="pagination">
        <span>共 {{ total }} 条</span>
        <button class="page-btn" :disabled="page <= 1" @click="page--; fetchData()">&#8249;</button>
        <button class="page-btn active">{{ page }}</button>
        <button class="page-btn" :disabled="page * pageSize >= total" @click="page++; fetchData()">&#8250;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

const records = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const shopList = ref<any[]>([])
const stats = ref<any>({})

const filters = reactive({
  keyword: '',
  couponType: '全部类型',
  status: '全部状态',
  shopId: null as number | null,
  startDate: '',
  endDate: '',
})

function couponTypeTag(type: string) {
  if (type === '团购套餐') return 'error'
  if (type === '代金券') return 'warning'
  if (type === '次卡') return 'processing'
  if (type === '组合券包') return 'purple'
  return 'default'
}

function statusTag(status: string) {
  if (status === '已核销') return 'success'
  if (status === '部分核销') return 'processing'
  if (status === '已撤销') return 'error'
  return 'default'
}

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) shopList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchStats() {
  try {
    const res: any = await request.get('/douyin/stats')
    if (res.code === 0) stats.value = res.data || {}
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, page_size: pageSize.value }
    if (filters.shopId) params.shop_id = filters.shopId
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.status !== '全部状态') params.status = filters.status
    if (filters.couponType !== '全部类型') params.coupon_type = filters.couponType
    if (filters.startDate) params.start_date = filters.startDate
    if (filters.endDate) params.end_date = filters.endDate
    const res: any = await request.get('/douyin/records', { params })
    if (res.code === 0) { records.value = res.data.items; total.value = res.data.total }
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function handleExport() {
  alert('导出中...')
}

function showCouponSearch() {
  const code = prompt('抖音券码查询：请输入券码')
  if (code) {
    filters.keyword = code
    fetchData()
  }
}

function handleRevoke(verifyNo: string) {
  if (confirm('确认撤销核销单号 ' + verifyNo + '？')) {
    request.post('/douyin/revoke', { verify_no: verifyNo }).then((res: any) => {
      if (res.code === 0) fetchData()
    })
  }
}

function handleContinueVerify(row: any) {
  alert('次卡剩余 ' + (row.max_count - (row.verify_count || 1)) + ' 次可核销')
}

function handleDetail(row: any) {
  alert('券码 ' + (row.coupon_code || row.verify_no) + ' 详情')
}

onMounted(async () => { await fetchShops(); await fetchStats(); await fetchData() })
</script>
