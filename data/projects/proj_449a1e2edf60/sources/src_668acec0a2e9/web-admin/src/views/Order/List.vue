<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">订单列表</div>
      <div class="page-subtitle">管理所有消费订单、查看支付状态与核销情况</div>
    </div>

    <div class="filter-bar">
      <input class="input" placeholder="订单号 / 用户昵称" style="width:200px" v-model="filters.keyword">
      <select class="select" style="width:160px" v-model="filters.status">
        <option value="">全部状态</option>
        <option value="待支付">待支付</option>
        <option value="已支付">已支付</option>
        <option value="已核销">已核销</option>
        <option value="已退款">已退款</option>
        <option value="退款处理中">退款处理中</option>
      </select>
      <select class="select" style="width:160px" v-model="filters.paymentMethod">
        <option value="">全部支付方式</option>
        <option value="余额">余额</option>
        <option value="微信支付">微信支付</option>
      </select>
      <span style="font-size:13px;color:var(--ant-text-2)">&#128197;</span>
      <input class="input" placeholder="开始日期" style="width:140px" type="date" v-model="filters.startDate">
      <span>~</span>
      <input class="input" placeholder="结束日期" style="width:140px" type="date" v-model="filters.endDate">
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-sm">导出</button>
    </div>

    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1677ff;color:#fff">&#128196;</div>
        <div class="stat-label">今日订单</div>
        <div class="stat-value">{{ todayOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#52c41a;color:#fff">&#10003;</div>
        <div class="stat-label">已支付</div>
        <div class="stat-value">{{ paidOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#722ed1;color:#fff">&#9681;</div>
        <div class="stat-label">已核销</div>
        <div class="stat-value">{{ verifiedOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ff4d4f;color:#fff">&#8630;</div>
        <div class="stat-label">已退款</div>
        <div class="stat-value">{{ refundedOrders }}</div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户</th>
              <th>商户</th>
              <th style="text-align:right">金额</th>
              <th>支付方式</th>
              <th>状态</th>
              <th>下单时间</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td class="col-mono">{{ o.order_no }}</td>
              <td>{{ o.user?.nickname || '-' }}</td>
              <td>{{ o.shop?.name || '-' }}</td>
              <td style="text-align:right;font-weight:600" class="money">¥{{ o.amount?.toFixed(2) }}</td>
              <td>{{ o.payment_method || '-' }}</td>
              <td>
                <span :class="['tag', statusTagClass(o.status)]">{{ o.status }}</span>
              </td>
              <td>{{ o.created_at }}</td>
              <td class="col-actions">
                <button class="btn-link" @click="handleDetail(o)">详情</button>
                <template v-if="o.status === '已支付'">
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleVerify(o.id)">核销</button>
                </template>
                <template v-if="o.status === '已支付' || o.status === '已核销'">
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleRefund(o)">退款</button>
                </template>
              </td>
            </tr>
            <tr v-if="orders.length === 0 && !loading">
              <td colspan="8" style="text-align:center;color:var(--ant-text-3);padding:40px">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 {{ total }} 条</span>
        <button class="page-btn" :disabled="page <= 1" @click="page--; fetchData()">‹</button>
        <button class="page-btn active">{{ page }}</button>
        <button class="page-btn" :disabled="page >= Math.ceil(total / pageSize)" @click="page++; fetchData()">›</button>
      </div>
    </div>

    <!-- Refund Dialog -->
    <div class="modal-mask" :class="{ open: showRefundDialog }" @click.self="showRefundDialog = false">
      <div class="modal">
        <div class="modal-head">
          <span>退款</span>
          <button class="close-btn" @click="showRefundDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">退款金额</label>
              <input class="input" type="number" v-model.number="refundForm.amount" placeholder="退款金额">
            </div>
            <div class="form-item">
              <label class="form-label">订单号</label>
              <input class="input" :value="refundOrderId" disabled>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">退款原因</label>
            <textarea class="textarea" v-model="refundForm.reason" placeholder="请输入退款原因"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showRefundDialog = false">取消</button>
          <button class="btn btn-primary" @click="submitRefund">确认退款</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { listOrders, verifyOrder, refundOrder } from '@/api/orders'
import { ElMessage } from 'element-plus'

const orders = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showRefundDialog = ref(false)
const refundOrderId = ref<number>(0)
const filters = reactive({ keyword: '', status: '', paymentMethod: '', startDate: '', endDate: '' })
const refundForm = reactive({ amount: 0, reason: '' })

const todayOrders = computed(() => orders.value.length)
const paidOrders = computed(() => orders.value.filter(o => o.status === '已支付').length)
const verifiedOrders = computed(() => orders.value.filter(o => o.status === '已核销').length)
const refundedOrders = computed(() => orders.value.filter(o => o.status === '已退款').length)

function statusTagClass(status: string) {
  const map: Record<string, string> = {
    '待支付': 'warning',
    '已支付': 'processing',
    '已核销': 'success',
    '已退款': 'default',
    '已取消': 'error',
    '退款处理中': 'warning',
  }
  return map[status] || 'default'
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await listOrders({ page: page.value, page_size: pageSize.value })
    if (res.code === 0) { orders.value = res.data.items; total.value = res.data.total }
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

async function handleVerify(id: number) {
  try {
    const res: any = await verifyOrder(id)
    if (res.code === 0) { ElMessage.success('核销成功'); fetchData() }
  } catch { ElMessage.error('核销失败') }
}

function handleDetail(_row: any) { ElMessage.info('订单详情功能开发中') }

function handleRefund(row: any) {
  refundOrderId.value = row.id
  refundForm.amount = row.amount
  refundForm.reason = ''
  showRefundDialog.value = true
}

async function submitRefund() {
  try {
    const res: any = await refundOrder(refundOrderId.value, { user_id: 0, amount: refundForm.amount, reason: refundForm.reason })
    if (res.code === 0) { ElMessage.success('退款申请已提交'); showRefundDialog.value = false; fetchData() }
  } catch { ElMessage.error('退款失败') }
}

onMounted(fetchData)
</script>
