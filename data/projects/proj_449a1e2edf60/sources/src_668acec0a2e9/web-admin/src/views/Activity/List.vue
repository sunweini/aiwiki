<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">活动管理</div>
      <div class="page-subtitle">总部创建活动 → 园区审核 → 推送商户 → 用户参与</div>
    </div>

    <div class="filter-bar">
      <select class="select" v-model="filters.status">
        <option>全部状态</option>
        <option>进行中</option>
        <option>已结束</option>
        <option>待审核</option>
      </select>
      <select class="select" v-model="filters.type">
        <option>全部类型</option>
        <option>优惠券活动</option>
        <option>满减活动</option>
        <option>限时折扣</option>
        <option>节日活动</option>
        <option>会员专享</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" @click="openAdd">+ 创建活动</button>
    </div>

    <!-- Stats -->
    <div class="stat-grid c4">
      <div class="stat-card">
        <div class="stat-label">进行中</div>
        <div class="stat-value">{{ stats.active }}<span class="unit">个</span></div>
        <div class="stat-icon" style="background:var(--ant-success-bg);color:var(--ant-success)">◉</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ stats.pending }}<span class="unit">个</span></div>
        <div class="stat-icon" style="background:var(--ant-warning-bg);color:var(--ant-warning)">⏳</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已结束</div>
        <div class="stat-value">{{ stats.ended }}<span class="unit">个</span></div>
        <div class="stat-icon" style="background:var(--ant-fill-quaternary);color:#999">◌</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">累计参与</div>
        <div class="stat-value">{{ stats.totalJoins }}<span class="unit">人次</span></div>
        <div class="stat-icon" style="background:var(--ant-primary-bg);color:var(--ant-primary)">◍</div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>活动标题</th>
                <th>类型</th>
                <th>适用园区</th>
                <th>适用商户</th>
                <th>活动时间</th>
                <th>状态</th>
                <th style="text-align:right">曝光量</th>
                <th style="text-align:right">参与</th>
                <th style="text-align:right">核销率</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in activities" :key="a.id">
                <td><b>{{ a.title }}</b></td>
                <td>
                  <span :class="['tag', activityTypeTag(a.type)]">{{ a.type }}</span>
                </td>
                <td>{{ a.park_scope }}</td>
                <td>{{ a.shop_scope }}</td>
                <td>{{ a.start_at }} ~ {{ a.end_at }}</td>
                <td>
                  <span :class="['tag', activityStatusTag(a.status)]">{{ activityStatusLabel(a.status) }}</span>
                </td>
                <td style="text-align:right">{{ (a.exposure_count || 0).toLocaleString() }}</td>
                <td style="text-align:right">{{ a.participant_count || 0 }}</td>
                <td style="text-align:right">{{ a.verify_rate || '-' }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleViewEffect(a)">效果</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="openEdit(a)">编辑</button>
                  <template v-if="a.status === 0">
                    <span class="divider">|</span>
                    <button class="btn-link" @click="handleReview(a)">审核</button>
                  </template>
                  <template v-if="a.status === 1">
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleEnd(a)">结束</button>
                  </template>
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

    <!-- Modal: Create/Edit Activity -->
    <div class="modal-mask" :class="{ open: showDialog }" @click.self="showDialog = false">
      <div class="modal" style="min-width:600px">
        <div class="modal-head">
          <span>{{ editingId ? '编辑活动' : '创建活动' }}</span>
          <button class="close-btn" @click="showDialog = false">x</button>
        </div>
        <div class="modal-body">
          <!-- Steps -->
          <div class="steps" style="margin-bottom:24px">
            <div class="step-item active">
              <div class="step-circle">1</div>
              <div class="step-label">基本信息</div>
            </div>
            <div class="step-line"></div>
            <div class="step-item">
              <div class="step-circle">2</div>
              <div class="step-label">活动规则</div>
            </div>
            <div class="step-line"></div>
            <div class="step-item">
              <div class="step-circle">3</div>
              <div class="step-label">投放范围</div>
            </div>
            <div class="step-line"></div>
            <div class="step-item">
              <div class="step-circle">4</div>
              <div class="step-label">预览发布</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">活动标题</label>
              <input class="input" v-model="form.title" placeholder="如：夏日稻田音乐节">
            </div>
            <div class="form-item">
              <label class="form-label required">活动类型</label>
              <select class="select" v-model="form.type">
                <option>优惠券活动</option>
                <option>满减活动</option>
                <option>限时折扣</option>
                <option>节日活动</option>
                <option>会员专享</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">开始时间</label>
              <input class="input" v-model="form.start_at" type="datetime-local">
            </div>
            <div class="form-item">
              <label class="form-label required">结束时间</label>
              <input class="input" v-model="form.end_at" type="datetime-local">
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">活动封面图</label>
            <div style="width:160px;height:90px;border:1px dashed var(--ant-border);border-radius:6px;background:var(--ant-fill-quaternary);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ant-text-3);gap:4px;font-size:12px;cursor:pointer">
              <span style="font-size:24px">+</span>上传封面
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">活动详情</label>
            <textarea class="textarea" v-model="form.content" rows="4" placeholder="支持富文本，描述活动详情、参与方式、注意事项等"></textarea>
          </div>
          <div class="form-item">
            <label class="form-label">适用园区</label>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
              <label><input type="radio" name="parkScope" value="all" v-model="form.park_scope" style="margin-right:4px"> 全部园区</label>
              <label><input type="radio" name="parkScope" value="specific" v-model="form.park_scope" style="margin-right:4px"> 指定园区</label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">适用商户</label>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
              <label><input type="radio" name="shopScope" value="all" v-model="form.shop_scope" style="margin-right:4px"> 全部商户</label>
              <label><input type="radio" name="shopScope" value="specific" v-model="form.shop_scope" style="margin-right:4px"> 指定商户</label>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showDialog = false">取消</button>
          <button class="btn" @click="handleSaveDraft" :disabled="saving">保存草稿</button>
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

const activities = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const filters = reactive({ type: '', status: '' })

const stats = reactive({ active: 0, pending: 0, ended: 0, totalJoins: 0 })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const visiblePages = computed(() => {
  const pages: number[] = []
  const tp = totalPages.value
  const cur = page.value
  for (let i = Math.max(1, cur - 2); i <= Math.min(tp, cur + 2); i++) pages.push(i)
  return pages
})

function activityTypeTag(type: string): string {
  const map: Record<string, string> = {
    '节日活动': 'purple', '会员专享': 'warning', '满减活动': 'processing',
    '限时折扣': 'error', '优惠券活动': 'cyan',
  }
  return map[type] || 'default'
}

function activityStatusTag(status: number): string {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'default' }
  return map[status] ?? 'default'
}

function activityStatusLabel(status: number): string {
  const map: Record<number, string> = { 0: '待审核', 1: '进行中', 2: '已结束' }
  return map[status] ?? '草稿'
}

function computeStats() {
  stats.active = activities.value.filter((a: any) => a.status === 1).length
  stats.pending = activities.value.filter((a: any) => a.status === 0).length
  stats.ended = activities.value.filter((a: any) => a.status === 2).length
  stats.totalJoins = activities.value.reduce((s: number, a: any) => s + (a.participant_count || 0), 0)
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: page.value, page_size: pageSize.value }
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    const res: any = await request.get('/activities', { params })
    if (res.code === 0) { activities.value = res.data.items; total.value = res.data.total; computeStats() }
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { title: '', type: '优惠券活动', cover_url: '', content: '', start_at: '', end_at: '', park_scope: 'all', shop_scope: 'all', status: 0 })
  showDialog.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, { ...row })
  showDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    let res: any
    if (editingId.value) {
      res = await request.put(`/activities/${editingId.value}`, form)
    } else {
      res = await request.post('/activities', form)
    }
    if (res.code === 0) { ElMessage.success('保存成功'); showDialog.value = false; fetchData() }
    else ElMessage.error(res.message || '保存失败')
  } catch { ElMessage.error('保存失败') }
  finally { saving.value = false }
}

async function handleSaveDraft() {
  saving.value = true
  try {
    const payload = { ...form, status: 0 }
    let res: any
    if (editingId.value) {
      res = await request.put(`/activities/${editingId.value}`, payload)
    } else {
      res = await request.post('/activities', payload)
    }
    if (res.code === 0) { ElMessage.success('草稿已保存'); showDialog.value = false; fetchData() }
    else ElMessage.error(res.message || '保存失败')
  } catch { ElMessage.error('保存失败') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  try {
    const res: any = await request.delete(`/activities/${id}`)
    if (res.code === 0) { ElMessage.success('已删除'); fetchData() }
    else ElMessage.error(res.message || '删除失败')
  } catch { /* cancelled */ }
}

function handleViewEffect(row: any) { ElMessage.info('查看活动效果: ' + row.title) }
function handleReview(row: any) { ElMessage.info('审核活动: ' + row.title) }
function handleEnd(row: any) { ElMessage.info('结束活动: ' + row.title) }

const form = reactive({
  title: '', type: '优惠券活动', cover_url: '', content: '',
  start_at: '', end_at: '', park_scope: 'all', shop_scope: 'all', status: 0,
})

onMounted(fetchData)
</script>
