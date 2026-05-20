<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">园区列表</div>
      <div class="page-subtitle">管理平台旗下所有园区</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <input class="input" v-model="filters.name" placeholder="园区名称 / 编码" style="width:200px">
      </div>
      <div class="filter-item">
        <select class="select" v-model.number="filters.status">
          <option :value="null">全部状态</option>
          <option :value="1">营业中</option>
          <option :value="0">已关闭</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <button class="btn btn-sm" @click="handleReset">重置</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" @click="openAdd">+ 新增园区</button>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>园区名称</th>
                <th>编码</th>
                <th>地址</th>
                <th>商户数</th>
                <th>状态</th>
                <th>创建时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td>
              </tr>
              <tr v-else-if="parks.length === 0">
                <td colspan="7" class="empty">暂无数据</td>
              </tr>
              <tr v-for="row in parks" :key="row.id">
                <td><b>{{ row.name }}</b></td>
                <td class="col-mono">{{ row.code }}</td>
                <td>{{ row.address }}</td>
                <td>{{ row.shop_count || '-' }}</td>
                <td>
                  <span :class="['tag', row.status === 1 ? 'success' : 'error']">
                    {{ row.status === 1 ? '营业中' : '已关闭' }}
                  </span>
                </td>
                <td>{{ row.created_at }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleEdit(row)">编辑</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleToggle(row)">{{ row.status === 1 ? '停用' : '启用' }}</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleDelete(row.id)">删除</button>
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
          >{{ p }}</button>
          <button class="page-btn" :disabled="page>=totalPages" @click="page++;fetchData()">&rsaquo;</button>
        </div>
      </div>
    </div>

    <!-- Modal: Add/Edit Park -->
    <div :class="['modal-mask', { open: showDialog }]" @click.self="showDialog=false">
      <div class="modal" style="min-width:520px">
        <div class="modal-head">
          <span>{{ editingId ? '编辑园区' : '新增园区' }}</span>
          <button class="close-btn" @click="showDialog=false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">园区名称</label>
              <input class="input" v-model="form.name" placeholder="如：黄梅袁夫稻田">
            </div>
            <div class="form-item">
              <label class="form-label required">园区编码</label>
              <input class="input" v-model="form.code" placeholder="自动生成或手动输入">
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">园区地址</label>
            <input class="input" v-model="form.address" placeholder="请输入详细地址">
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">联系人</label>
              <input class="input" v-model="form.contact_name" placeholder="请输入联系人姓名">
            </div>
            <div class="form-item">
              <label class="form-label">联系电话</label>
              <input class="input" v-model="form.contact_phone" placeholder="请输入联系电话">
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">状态</label>
            <div style="display:flex;gap:14px;font-size:14px">
              <label><input type="radio" name="parkStatus" :value="1" v-model.number="form.status" style="margin-right:4px"> 营业中</label>
              <label><input type="radio" name="parkStatus" :value="0" v-model.number="form.status" style="margin-right:4px"> 已关闭</label>
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
import { listParks, createPark, updatePark, deletePark } from '@/api/parks'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const parks = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const filters = reactive({ name: '', status: null as number | null })

const form = reactive({ name: '', code: '', address: '', contact_name: '', contact_phone: '', status: 1 })

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

async function fetchData() {
  loading.value = true
  try {
    const res: any = await listParks({ page: page.value, page_size: pageSize.value })
    if (res.code === 0) { parks.value = res.data.items; total.value = res.data.total }
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

function handleReset() {
  filters.name = ''
  filters.status = null
  fetchData()
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', code: '', address: '', contact_name: '', contact_phone: '', status: 1 })
  showDialog.value = true
}

function handleEdit(row: any) { editingId.value = row.id; Object.assign(form, row); showDialog.value = true }

async function handleDelete(id: number) {
  if (!confirm('确定删除?')) return
  try { const res: any = await deletePark(id); if (res.code === 0) { ElMessage.success('删除成功'); fetchData() } }
  catch { ElMessage.error('删除失败') }
}

async function handleToggle(row: any) {
  try {
    const res: any = await request.post(`/parks/${row.id}/toggle`, { status: row.status === 1 ? 0 : 1 })
    if (res.code === 0) { ElMessage.success('操作成功'); fetchData() }
  } catch { ElMessage.error('操作失败') }
}

async function handleSubmit() {
  try {
    let res: any
    if (editingId.value) { res = await updatePark(editingId.value, form) }
    else { res = await createPark(form) }
    if (res.code === 0) { ElMessage.success('保存成功'); showDialog.value = false; fetchData() }
  } catch { ElMessage.error('保存失败') }
}

onMounted(fetchData)
</script>
