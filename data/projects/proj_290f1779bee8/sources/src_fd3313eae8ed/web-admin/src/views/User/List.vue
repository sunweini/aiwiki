<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">客户列表</div>
      <div class="page-subtitle">管理 C 端注册客户、查看余额与消费、人脸录入状态</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <input class="input" v-model="filters.nick" placeholder="客户昵称">
      </div>
      <div class="filter-item">
        <input class="input" v-model="filters.phone" placeholder="手机号">
      </div>
      <div class="filter-item">
        <select class="select" v-model.number="filters.faceState">
          <option :value="null">全部人脸状态</option>
          <option :value="1">已录入</option>
          <option :value="0">未录入</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <button class="btn btn-sm" @click="handleReset">重置</button>
      <div class="spacer"></div>
      <button class="btn" @click="handleExport">导出</button>
      <button class="btn btn-primary" @click="openAdd">+ 手动添加</button>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>客户ID</th>
                <th>昵称</th>
                <th>手机号</th>
                <th>OpenID</th>
                <th style="text-align:right">余额</th>
                <th style="text-align:right">累计消费</th>
                <th>人脸状态</th>
                <th>注册时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="9" class="empty">暂无数据</td>
              </tr>
              <tr v-for="row in users" :key="row.id">
                <td><span class="code-chip">{{ row.id }}</span></td>
                <td><b>{{ row.nickname }}</b></td>
                <td>{{ row.phone || '-' }}</td>
                <td class="col-mono">{{ row.openid || '-' }}</td>
                <td style="text-align:right" :class="['money', (row.balance || 0) > 0 ? 'success' : '']">
                  {{ formatMoney(row.balance) }}
                </td>
                <td style="text-align:right" class="money">
                  {{ formatMoney(row.total_consumption) }}
                </td>
                <td>
                  <span :class="['tag', row.face_registered ? 'success' : 'default']">
                    {{ row.face_registered ? '已录入' : '未录入' }}
                  </span>
                </td>
                <td>{{ row.created_at }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleEdit(row)">详情</button>
                  <span class="divider">|</span>
                  <button class="btn-link">充值记录</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleDisable(row)">
                    {{ row.disabled ? '启用' : '禁用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>共 {{ total }} 条</span>
          <select class="select" style="width:100px" v-model.number="pageSize" @change="page=1;fetchData()">
            <option :value="10">10 条/页</option>
            <option :value="20">20 条/页</option>
            <option :value="50">50 条/页</option>
          </select>
          <button class="page-btn" :disabled="page<=1" @click="page--;fetchData()">&lsaquo;</button>
          <button
            v-for="p in pageNumbers" :key="p"
            class="page-btn"
            :class="{ active: p === page }"
            @click="page=p;fetchData()"
          >{{ typeof p === 'number' ? p : p }}</button>
          <button class="page-btn" :disabled="page>=totalPages" @click="page++;fetchData()">&rsaquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal: User Detail/Edit -->
    <div :class="['modal-mask', { open: showDialog }]" @click.self="showDialog=false">
      <div class="modal" style="min-width:520px">
        <div class="modal-head">
          <span>{{ editingId ? '编辑用户' : '手动添加客户' }}</span>
          <button class="close-btn" @click="showDialog=false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">昵称</label>
              <input class="input" v-model="form.nickname" placeholder="请输入客户昵称">
            </div>
            <div class="form-item">
              <label class="form-label">手机号</label>
              <input class="input" v-model="form.phone" placeholder="请输入手机号">
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">会员等级</label>
              <select class="select" v-model="form.member_level">
                <option value="普通">普通</option>
                <option value="VIP1">VIP1</option>
                <option value="VIP2">VIP2</option>
                <option value="VIP3">VIP3</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">人脸状态</label>
              <select class="select" v-model.number="form.face_registered">
                <option :value="0">未录入</option>
                <option :value="1">已录入</option>
              </select>
            </div>
          </div>
          <div v-if="editingId" class="form-row">
            <div class="form-item">
              <label class="form-label">余额</label>
              <input class="input" v-model.number="form.balance" type="number" step="0.01" placeholder="0.00">
            </div>
            <div class="form-item">
              <label class="form-label">累计消费</label>
              <input class="input" v-model.number="form.total_consumption" type="number" step="0.01" placeholder="0.00">
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showDialog=false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { listUsers, getUserStats, updateUser } from '@/api/users'
import { ElMessage } from 'element-plus'

const users = ref<any[]>([])
const total = ref(0)
const stats = ref<any>(null)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const filters = reactive({ nick: '', phone: '', faceState: null as number | null })

const form = reactive({ nickname: '', phone: '', member_level: '普通', face_registered: 0, balance: 0, total_consumption: 0 })

const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = page.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 4) pages.push('...')
    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (cp < tp - 3) pages.push('...')
    pages.push(tp)
  }
  return pages
})

function formatMoney(val: number | null | undefined): string {
  const v = val ?? 0
  return '¥' + v.toFixed(2)
}

async function fetchData() {
  loading.value = true
  try {
    const [userRes, statRes]: any[] = await Promise.all([
      listUsers({ page: page.value, page_size: pageSize.value }),
      getUserStats(),
    ])
    if (userRes.code === 0) { users.value = userRes.data.items; total.value = userRes.data.total }
    if (statRes.code === 0) stats.value = statRes.data
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

function handleReset() {
  filters.nick = ''
  filters.phone = ''
  filters.faceState = null
  fetchData()
}

function handleExport() {
  ElMessage.info('导出功能开发中')
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { nickname: '', phone: '', member_level: '普通', face_registered: 0, balance: 0, total_consumption: 0 })
  showDialog.value = true
}

function handleEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, {
    nickname: row.nickname, phone: row.phone || '', member_level: row.member_level || '普通',
    face_registered: row.face_registered ? 1 : 0, balance: row.balance || 0, total_consumption: row.total_consumption || 0,
  })
  showDialog.value = true
}

async function handleDisable(row: any) {
  try {
    const res: any = await updateUser(row.id, { disabled: !row.disabled })
    if (res.code === 0) { ElMessage.success('操作成功'); fetchData() }
  } catch { ElMessage.error('操作失败') }
}

async function handleSubmit() {
  try {
    if (!editingId.value) {
      ElMessage.warning('手动添加功能请使用后端接口')
      showDialog.value = false
      return
    }
    const res: any = await updateUser(editingId.value, form)
    if (res.code === 0) { ElMessage.success('保存成功'); showDialog.value = false; fetchData() }
  } catch { ElMessage.error('保存失败') }
}

onMounted(fetchData)
</script>
