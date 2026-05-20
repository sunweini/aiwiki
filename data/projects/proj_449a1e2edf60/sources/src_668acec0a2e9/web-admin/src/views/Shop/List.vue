<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">店铺列表</div>
      <div class="page-subtitle">管理全部园区的所有商户/店铺</div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <input class="input" v-model="filters.name" placeholder="店铺名称">
      </div>
      <div class="filter-item">
        <select class="select" v-model.number="filters.status">
          <option :value="null">全部状态</option>
          <option :value="1">营业中</option>
          <option :value="2">休息中</option>
          <option :value="0">已关闭</option>
        </select>
      </div>
      <div class="filter-item">
        <select class="select" v-model.number="filters.typeId">
          <option :value="null">全部类型</option>
          <option :value="1">餐饮</option>
          <option :value="2">零售</option>
          <option :value="3">体验</option>
        </select>
      </div>
      <div class="filter-item">
        <select class="select" v-model.number="filters.parkId">
          <option :value="null">全部园区</option>
          <option v-for="p in parkList" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" @click="fetchData">查询</button>
      <button class="btn btn-sm" @click="handleReset">重置</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" @click="openAdd">+ 添加店铺</button>
    </div>

    <div class="card">
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>店铺名称</th>
                <th>所属园区</th>
                <th>地址</th>
                <th>类型</th>
                <th>状态</th>
                <th>创建时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td>
              </tr>
              <tr v-else-if="shops.length === 0">
                <td colspan="7" class="empty">暂无数据</td>
              </tr>
              <tr v-for="row in shops" :key="row.id">
                <td><b>{{ row.name }}</b></td>
                <td>{{ row.park?.name || row.park_name || '-' }}</td>
                <td>{{ row.address }}</td>
                <td>
                  <span :class="['tag', typeTagClass(row.type?.name || row.type_name)]">
                    {{ row.type?.name || row.type_name || '-' }}
                  </span>
                </td>
                <td>
                  <span :class="['tag', statusTagClass(row.status)]">
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td>{{ row.created_at }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="handleEdit(row)">编辑</button>
                  <span class="divider">|</span>
                  <button class="btn-link">二维码</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="handleToggle(row)">
                    {{ row.status === 1 ? '下架' : '上架' }}
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

    <!-- Modal: Add/Edit Shop -->
    <div :class="['modal-mask', { open: showDialog }]" @click.self="showDialog=false">
      <div class="modal" style="min-width:520px">
        <div class="modal-head">
          <span>{{ editingId ? '编辑店铺' : '添加店铺' }}</span>
          <button class="close-btn" @click="showDialog=false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">店铺名称</label>
              <input class="input" v-model="form.name" placeholder="请输入店铺名称">
            </div>
            <div class="form-item">
              <label class="form-label required">店铺类型</label>
              <select class="select" v-model.number="form.type_id">
                <option :value="1">餐饮</option>
                <option :value="2">零售</option>
                <option :value="3">体验</option>
              </select>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">地址</label>
            <input class="input" v-model="form.address" placeholder="请输入店铺地址">
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">所属园区</label>
              <select class="select" v-model.number="form.park_id">
                <option v-for="p in parkList" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="form-item">
              <label class="form-label">状态</label>
              <select class="select" v-model.number="form.status">
                <option :value="1">营业中</option>
                <option :value="2">休息中</option>
                <option :value="0">已关闭</option>
              </select>
            </div>
          </div>
          <div style="border-top:1px solid var(--ant-border-secondary);margin:16px 0;padding-top:16px">
            <div style="font-size:14px;font-weight:600;margin-bottom:12px">收款信息</div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">收款银行</label>
                <select class="select" v-model="form.bank_name">
                  <option>招商银行</option>
                  <option>工商银行</option>
                  <option>建设银行</option>
                  <option>农业银行</option>
                </select>
              </div>
              <div class="form-item">
                <label class="form-label">银行账号</label>
                <input class="input" v-model="form.bank_account" placeholder="银行账号">
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">收款人</label>
                <input class="input" v-model="form.bank_holder" placeholder="收款人姓名">
              </div>
              <div class="form-item">
                <label class="form-label">联系电话</label>
                <input class="input" v-model="form.contact_phone" placeholder="联系电话">
              </div>
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
import { listShops, createShop, updateShop, getShopStats } from '@/api/shops'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const shops = ref<any[]>([])
const total = ref(0)
const stats = ref<Record<string, number> | null>(null)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const parkList = ref<any[]>([])
const filters = reactive({ name: '', status: null as number | null, typeId: null as number | null, parkId: null as number | null })

const form = reactive({ name: '', address: '', park_id: 1, type_id: 1, status: 1, bank_name: '', bank_account: '', bank_holder: '', contact_phone: '' })

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

function typeTagClass(type: string): string {
  const map: Record<string, string> = { '餐饮': 'processing', '零售': 'purple', '体验': 'cyan' }
  return map[type] || 'default'
}

function statusTagClass(status: number): string {
  return status === 1 ? 'success' : 'default'
}

function statusLabel(status: number): string {
  const map: Record<number, string> = { 1: '营业中', 2: '休息中', 0: '已关闭' }
  return map[status] || '未知'
}

async function fetchParks() {
  try {
    const res: any = await request.get('/parks', { params: { page: 1, page_size: 50 } })
    if (res.code === 0) parkList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const [shopRes, statRes]: any[] = await Promise.all([
      listShops({ page: page.value, page_size: pageSize.value }),
      getShopStats(),
    ])
    if (shopRes.code === 0) { shops.value = shopRes.data.items; total.value = shopRes.data.total }
    if (statRes.code === 0) stats.value = statRes.data
  } catch { ElMessage.error('获取列表失败') }
  finally { loading.value = false }
}

function handleReset() {
  filters.name = ''
  filters.status = null
  filters.typeId = null
  filters.parkId = null
  fetchData()
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', address: '', park_id: 1, type_id: 1, status: 1, bank_name: '', bank_account: '', bank_holder: '', contact_phone: '' })
  showDialog.value = true
}

function handleEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name, address: row.address, park_id: row.park_id, type_id: row.type_id, status: row.status,
    bank_name: row.bank_name || '', bank_account: row.bank_account || '', bank_holder: row.bank_holder || '', contact_phone: row.contact_phone || '',
  })
  showDialog.value = true
}

async function handleToggle(row: any) {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const res: any = await updateShop(row.id, { status: newStatus })
    if (res.code === 0) { ElMessage.success('操作成功'); fetchData() }
  } catch { ElMessage.error('操作失败') }
}

async function handleSubmit() {
  try {
    let res: any
    if (editingId.value) { res = await updateShop(editingId.value, form) }
    else { res = await createShop(form) }
    if (res.code === 0) { ElMessage.success('保存成功'); showDialog.value = false; fetchData() }
  } catch { ElMessage.error('保存失败') }
}

onMounted(async () => { await fetchParks(); await fetchData() })
</script>
