<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">操作日志</div>
      <div class="page-subtitle">系统级操作日志查询与审计</div>
    </div>

    <div class="filter-bar">
      <input class="input" v-model="filters.username" placeholder="用户名" style="width:140px">
      <select class="select" v-model="filters.action">
        <option value="">操作类型</option>
        <option>新增</option>
        <option>修改</option>
        <option>删除</option>
        <option>查询</option>
      </select>
      <select class="select" v-model="filters.module">
        <option value="">操作模块</option>
        <option>系统管理</option>
        <option>角色管理</option>
        <option>用户管理</option>
        <option>订单管理</option>
      </select>
      <select class="select" v-model="filters.status">
        <option value="">操作状态</option>
        <option value="1">成功</option>
        <option value="0">失败</option>
      </select>
      <input class="input" v-model="filters.startDate" placeholder="开始时间" style="width:140px" type="date">
      <span>~</span>
      <input class="input" v-model="filters.endDate" placeholder="结束时间" style="width:140px" type="date">
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-danger btn-sm" @click="handleClear">清除日志</button>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>日志ID</th>
                <th>用户名</th>
                <th>操作类型</th>
                <th>操作模块</th>
                <th>操作描述</th>
                <th>IP地址</th>
                <th>状态</th>
                <th>操作时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in logs" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.employee?.real_name || row.employee?.username || '-' }}</td>
                <td>
                  <span class="tag" :class="actionTagClass(row.action)">{{ row.action }}</span>
                </td>
                <td>{{ row.module }}</td>
                <td class="col-mono">{{ row.detail || '-' }}</td>
                <td>{{ row.ip }}</td>
                <td>
                  <span class="tag" :class="row.status === 1 ? 'success' : 'error'">
                    {{ row.status === 1 ? '成功' : '失败' }}
                  </span>
                </td>
                <td>{{ row.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>共 {{ total }} 条</span>
          <button
            class="page-btn"
            :class="{ active: page === 1 }"
            :disabled="page <= 1"
            @click="goPage(1)"
          >1</button>
          <button
            v-if="totalPages > 3"
            class="page-btn"
            :class="{ active: page === 2 }"
            @click="goPage(2)"
          >2</button>
          <button
            v-if="totalPages > 5"
            class="page-btn"
            disabled
          >...</button>
          <button
            v-if="totalPages > 1"
            class="page-btn"
            :class="{ active: page === totalPages }"
            @click="goPage(totalPages)"
          >{{ totalPages }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/api/request'

const logs = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({
  username: '',
  action: '',
  module: '',
  status: '',
  startDate: '',
  endDate: '',
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function actionTagClass(action: string): string {
  if (action === '新增') return 'success'
  if (action === '修改') return 'warning'
  if (action === '删除') return 'error'
  if (action === '登录') return 'warning'
  return 'default'
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchData()
}

async function fetchData() {
  try {
    const params: any = { page: page.value, page_size: pageSize.value }
    if (filters.username) params.username = filters.username
    if (filters.action) params.action = filters.action
    if (filters.module) params.module = filters.module
    if (filters.status) params.status = Number(filters.status)
    if (filters.startDate) params.start_date = filters.startDate
    if (filters.endDate) params.end_date = filters.endDate

    const res: any = await request.get('/settings/logs', { params })
    if (res.code === 0) {
      logs.value = res.data.items
      total.value = res.data.total
    }
  } catch {
    // Handle error silently
  }
}

async function handleClear() {
  if (!confirm('确认清除所有日志？此操作不可恢复。')) return
  try {
    const res: any = await request.delete('/settings/logs')
    if (res.code === 0) {
      showToast('日志已清除')
      fetchData()
    }
  } catch {
    showToast('清除失败')
  }
}

function showToast(msg: string) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}

onMounted(fetchData)
</script>
