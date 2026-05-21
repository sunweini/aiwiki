<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">提现管理</div>
      <div class="page-subtitle">商户提现审核 · 银行信息确认 · 自动生成对账单 · 小程序通知</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr;gap:16px">
      <!-- 待审核提现申请 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">待审核提现申请</div>
        </div>
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>申请编号</th>
                <th>店铺</th>
                <th>所属园区</th>
                <th style="text-align:right">提现金额</th>
                <th>开户银行</th>
                <th>银行账号</th>
                <th>开户姓名</th>
                <th>申请时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in pendingWithdrawals" :key="w.id">
                <td class="col-mono">{{ w.id }}</td>
                <td><b>{{ w.shop }}</b></td>
                <td>{{ w.shopPark }}</td>
                <td style="text-align:right;font-weight:600" class="money">&#165;{{ w.amount?.toFixed(2) || '0.00' }}</td>
                <td>{{ w.bankName }}</td>
                <td class="col-mono">{{ w.bankAccount }}</td>
                <td>{{ w.bankHolder }}</td>
                <td>{{ w.applyAt }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="openWithdrawApprove(w)">通过</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleReject(w.id)">驳回</button>
                </td>
              </tr>
              <tr v-if="pendingWithdrawals.length === 0">
                <td colspan="9" style="text-align:center;color:var(--ant-text-3);padding:30px">暂无待审核申请</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 提现历史 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">提现历史</div>
          <button class="btn btn-sm">导出</button>
        </div>
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>申请编号</th>
                <th>店铺</th>
                <th>所属园区</th>
                <th style="text-align:right">金额</th>
                <th>开户银行</th>
                <th>开户姓名</th>
                <th>对账单</th>
                <th>状态</th>
                <th>审核人</th>
                <th>审核时间</th>
                <th>打款时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in withdrawHistory" :key="w.id">
                <td class="col-mono">{{ w.id }}</td>
                <td><b>{{ w.shop }}</b></td>
                <td>{{ w.shopPark }}</td>
                <td style="text-align:right" class="money">&#165;{{ w.amount?.toFixed(2) || '0.00' }}</td>
                <td>{{ w.bankName }}</td>
                <td>{{ w.bankHolder }}</td>
                <td>
                  <template v-if="w.reconciliationId">
                    <span class="col-mono">{{ w.reconciliationId }}</span>
                    <button class="btn-link">下载</button>
                  </template>
                  <template v-else>-</template>
                </td>
                <td>
                  <span :class="['tag', historyTagClass(w.status)]">{{ historyLabel(w.status) }}</span>
                </td>
                <td>{{ w.reviewer || '-' }}</td>
                <td>{{ w.reviewedAt || '-' }}</td>
                <td>{{ w.paidAt || '-' }}</td>
              </tr>
              <tr v-if="withdrawHistory.length === 0">
                <td colspan="11" style="text-align:center;color:var(--ant-text-3);padding:30px">暂无提现历史</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div class="modal-mask" :class="{ open: showApproveModal }" @click.self="showApproveModal = false">
      <div class="modal" style="min-width:600px">
        <div class="modal-head">
          <span>提现审核 · {{ approveForm.id }}</span>
          <button class="close-btn" @click="showApproveModal = false">×</button>
        </div>
        <div class="modal-body">
          <div style="padding:10px 0">
            <div style="background:var(--ant-primary-bg);border:1px solid var(--ant-primary-border);border-radius:8px;padding:14px;margin-bottom:18px">
              <div style="font-size:14px;font-weight:500;color:var(--ant-primary)">&#128203; 审核通过后将自动生成对账单并通知商户</div>
              <div style="font-size:12px;color:var(--ant-text-2);margin-top:4px">对账单将通过小程序消息推送至商户端 · 商户确认后自动下账</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:14px">
              <div>
                <div style="color:var(--ant-text-3);margin-bottom:4px">申请编号</div>
                <div class="col-mono">{{ approveForm.id }}</div>
              </div>
              <div>
                <div style="color:var(--ant-text-3);margin-bottom:4px">店铺 · 园区</div>
                <div><b>{{ approveForm.shop }}</b> · {{ approveForm.shopPark }}</div>
              </div>
              <div>
                <div style="color:var(--ant-text-3);margin-bottom:4px">提现金额</div>
                <div style="font-size:22px;font-weight:700;color:var(--ant-error)" class="money">&#165;{{ approveForm.amount?.toFixed(2) || '0.00' }}</div>
              </div>
              <div>
                <div style="color:var(--ant-text-3);margin-bottom:4px">申请人</div>
                <div>{{ approveForm.bankHolder }}</div>
              </div>
            </div>

            <div style="border-top:1px solid var(--ant-border-secondary);margin-top:16px;padding-top:16px">
              <div style="font-size:14px;font-weight:600;margin-bottom:10px">&#127974; 银行账户信息</div>
              <div class="form-row">
                <div class="form-item">
                  <label class="form-label">开户银行</label>
                  <input class="input" v-model="approveForm.bankName">
                </div>
                <div class="form-item">
                  <label class="form-label">银行账号</label>
                  <input class="input" v-model="approveForm.bankAccount">
                </div>
              </div>
              <div class="form-item">
                <label class="form-label">开户姓名</label>
                <input class="input" v-model="approveForm.bankHolder">
              </div>
            </div>

            <div style="border-top:1px solid var(--ant-border-secondary);margin-top:16px;padding-top:16px">
              <div style="font-size:14px;font-weight:600;margin-bottom:10px">&#128196; 自动生成对账单</div>
              <div style="padding:12px;background:var(--ant-fill-quaternary);border-radius:8px;font-size:13px">
                <div style="display:flex;justify-content:space-between;padding:6px 0"><span>对账编号</span><span class="col-mono">DZ{{ Date.now().toString().slice(-12) }}</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0"><span>商户</span><span>{{ approveForm.shop }}</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0"><span>对账周期</span><span>2026-05-01 ~ 2026-05-14</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0"><span>提现金额</span><span style="font-weight:600;color:var(--ant-error)" class="money">&#165;{{ approveForm.amount?.toFixed(2) || '0.00' }}</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0"><span>通知方式</span><span>小程序商户端 · 消息推送</span></div>
              </div>
            </div>

            <div style="margin-top:16px;padding:12px;background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;font-size:12px;color:#d48806;line-height:1.7">
              <b>&#9201; 流程说明</b><br>
              &middot; 点击「通过」→ 生成对账单 → 推送小程序通知给商户<br>
              &middot; 商户在商户端小程序确认对账单<br>
              &middot; 确认后系统自动下账：扣减园区余额 &amp; 平台总部余额<br>
              &middot; 当前申请状态变为「待打款」→ 财务打款后点击「确认打款」<br>
              &middot; 完成后归档至提现历史
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showApproveModal = false">取消</button>
          <button class="btn btn-primary" @click="handleApprove">&#10004; 通过 · 生成对账单并通知商户</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listWithdraws, reviewWithdraw } from '@/api/finance'
import { ElMessage } from 'element-plus'

const pendingWithdrawals = ref<any[]>([])
const withdrawHistory = ref<any[]>([])
const showApproveModal = ref(false)
const approveForm = ref<any>({})

function historyTagClass(status: string) {
  const map: Record<string, string> = {
    paid: 'success',
    pending_pay: 'warning',
    rejected: 'error',
  }
  return map[status] || 'default'
}

function historyLabel(status: string) {
  const map: Record<string, string> = {
    paid: '已打款',
    pending_pay: '待打款',
    rejected: '已驳回',
  }
  return map[status] || status
}

async function fetchWithdrawals() {
  try {
    const res: any = await listWithdraws({ status: 'pending' })
    if (res.code === 0) {
      pendingWithdrawals.value = res.data.items || res.data || []
    }
  } catch {
    ElMessage.error('获取待审核提现申请失败')
  }
}

async function fetchHistory() {
  try {
    const res: any = await listWithdraws({ status: 'history' })
    if (res.code === 0) {
      withdrawHistory.value = res.data.items || res.data || []
    }
  } catch {
    ElMessage.error('获取提现历史失败')
  }
}

function openWithdrawApprove(w: any) {
  approveForm.value = { ...w }
  showApproveModal.value = true
}

async function handleApprove() {
  try {
    const res: any = await reviewWithdraw(approveForm.value.id, { action: 'approve' })
    if (res.code === 0) {
      ElMessage.success('提现已通过 · 对账单已生成 · 小程序通知已发送至 ' + approveForm.value.shop)
      showApproveModal.value = false
      fetchWithdrawals()
      fetchHistory()
    }
  } catch {
    ElMessage.error('审核失败')
  }
}

async function handleReject(id: number) {
  try {
    const res: any = await reviewWithdraw(id, { action: 'reject' })
    if (res.code === 0) {
      ElMessage.success('已驳回提现申请')
      fetchWithdrawals()
      fetchHistory()
    }
  } catch {
    ElMessage.error('驳回失败')
  }
}

onMounted(() => {
  fetchWithdrawals()
  fetchHistory()
})
</script>
