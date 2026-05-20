<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">员工列表</div>
      <div class="page-subtitle">管理平台所有员工账号</div>
    </div>

    <div class="filter-bar">
      <input class="input" v-model="filters.keyword" placeholder="姓名 / 用户名" style="width:180px">
      <select class="select" v-model="filters.park">
        <option>全部园区</option>
        <option>黄梅</option>
        <option>武汉</option>
      </select>
      <select class="select" v-model="filters.shop">
        <option>全部店铺</option>
      </select>
      <select class="select" v-model="filters.role">
        <option>全部角色</option>
        <option>平台管理员</option>
        <option>园区管理员</option>
        <option>商户管理员</option>
        <option>商户收银员</option>
      </select>
      <input class="input" v-model="filters.phone" placeholder="手机号" style="width:160px">
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn" @click="handleExport">导出</button>
      <button class="btn btn-primary" @click="openAdd">+ 新增员工</button>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>用户名</th>
                <th>手机号</th>
                <th>所属园区</th>
                <th>所属店铺</th>
                <th>角色</th>
                <th>岗位</th>
                <th>状态</th>
                <th>创建时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in employees" :key="e.id">
                <td><b>{{ e.real_name || '-' }}</b></td>
                <td class="col-mono">{{ e.username }}</td>
                <td>{{ e.phone || '-' }}</td>
                <td>{{ e.park_name || '-' }}</td>
                <td>{{ e.shop_name || '-' }}</td>
                <td>
                  <span :class="['tag', roleTagClass(e.role)]">{{ roleLabel(e.role) }}</span>
                </td>
                <td>{{ e.position || '-' }}</td>
                <td>
                  <span :class="['tag', e.status === 1 ? 'success' : 'default']">{{ e.status === 1 ? '在线' : '离线' }}</span>
                </td>
                <td>{{ e.created_at }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="openEdit(e)">编辑</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleResetPwd(e)">重置密码</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleToggle(e)">{{ e.status === 1 ? '禁用' : '启用' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>共 {{ total }} 条</span>
          <button class="page-btn" :disabled="page <= 1" @click="page--; fetchData()">&lt;</button>
          <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{ active: p === page }" @click="page = p; fetchData()">{{ p }}</button>
          <button class="page-btn" :disabled="page >= totalPages" @click="page++; fetchData()">&gt;</button>
        </div>
      </div>
    </div>

    <!-- Modal: Add/Edit Employee -->
    <div class="modal-mask" :class="{ open: showDialog }" @click.self="showDialog = false">
      <div class="modal">
        <div class="modal-head">
          <span>{{ editingId ? '编辑员工' : '新增员工' }}</span>
          <button class="close-btn" @click="showDialog = false">x</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="form-label required">用户名</label>
            <input class="input" v-model="form.username" :disabled="!!editingId">
          </div>
          <div class="form-item" v-if="!editingId">
            <label class="form-label required">密码</label>
            <input class="input" v-model="form.password" type="password" placeholder="默认 123456">
          </div>
          <div class="form-item">
            <label class="form-label">姓名</label>
            <input class="input" v-model="form.real_name">
          </div>
          <div class="form-item">
            <label class="form-label">手机号</label>
            <input class="input" v-model="form.phone">
          </div>
          <div class="form-item">
            <label class="form-label required">角色</label>
            <select class="select" v-model="form.role">
              <option value="ADMIN_PLATFORM">平台超级管理员</option>
              <option value="PLATFORM_OPER">总部运营</option>
              <option value="PARK_ADMIN">园区管理员</option>
              <option value="PARK_MANAGER">园区经理</option>
              <option value="SHOP_ADMIN">商户管理员</option>
              <option value="SHOP_CASHIER">商户收银员</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">岗位</label>
            <input class="input" v-model="form.position">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const employees = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const filters = reactive({ keyword: '', park: '', shop: '', role: '', phone: '' })

const form = reactive({ username: '', password: '', real_name: '', phone: '', role: 'PARK_ADMIN', position: '' })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const visiblePages = computed(() => {
  const pages: number[] = []
  const tp = totalPages.value
  const cur = page.value
  for (let i = Math.max(1, cur - 2); i <= Math.min(tp, cur + 2); i++) pages.push(i)
  return pages
})

function roleTagClass(role: string): string {
  const map: Record<string, string> = {
    ADMIN_PLATFORM: 'error', PLATFORM_OPER: 'error',
    PARK_ADMIN: 'processing', PARK_MANAGER: 'processing',
    SHOP_ADMIN: 'purple', SHOP_CASHIER: 'cyan',
  }
  return map[role] || 'default'
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN_PLATFORM: '平台超级管理员', PLATFORM_OPER: '总部运营',
    PARK_ADMIN: '园区管理员', PARK_MANAGER: '园区经理',
    SHOP_ADMIN: '商户管理员', SHOP_CASHIER: '商户收银员',
  }
  return map[role] || role
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, page_size: pageSize.value }
    if (filters.role) params.role = filters.role
    const res: any = await request.get('/employees', { params })
    if (res.code === 0) { employees.value = res.data.items; total.value = res.data.total }
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { username: '', password: '', real_name: '', phone: '', role: 'PARK_ADMIN', position: '' })
  showDialog.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, { username: row.username, password: '', real_name: row.real_name || '', phone: row.phone || '', role: row.role, position: row.position || '' })
  showDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    let res: any
    const payload: any = { ...form }
    if (editingId.value) {
      if (!payload.password) delete payload.password
      res = await request.put(`/employees/${editingId.value}`, payload)
    } else {
      if (!payload.password) payload.password = '123456'
      res = await request.post('/employees', payload)
    }
    if (res.code === 0) { ElMessage.success('保存成功'); showDialog.value = false; fetchData() }
    else ElMessage.error(res.message || '保存失败')
  } catch { ElMessage.error('保存失败') }
  finally { saving.value = false }
}

async function handleToggle(row: any) {
  try {
    const res: any = await request.post(`/employees/${row.id}/toggle`, { status: row.status === 1 ? 0 : 1 })
    if (res.code === 0) { ElMessage.success('操作成功'); fetchData() }
    else ElMessage.error(res.message || '操作失败')
  } catch { ElMessage.error('操作失败') }
}

async function handleResetPwd(row: any) {
  try {
    const res: any = await request.post(`/employees/${row.id}/reset-password`)
    if (res.code === 0) { ElMessage.success('密码已重置为 123456') }
    else ElMessage.error(res.message || '重置失败')
  } catch { ElMessage.error('重置失败') }
}

function handleExport() {
  ElMessage.info('导出功能开发中')
}

onMounted(fetchData)
</script>
