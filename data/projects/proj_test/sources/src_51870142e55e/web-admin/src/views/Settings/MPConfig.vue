<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">小程序配置</div>
      <div class="page-subtitle">管理多个微信小程序 &middot; 按端类型分类配置 &middot; 版本发布管理</div>
    </div>

    <!-- 已接入小程序列表 -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">已接入小程序 ({{ mpList.length }})</div>
        <button class="btn btn-primary" @click="showAddModal = true">+ 添加小程序</button>
      </div>
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>小程序名称</th>
                <th>AppID</th>
                <th>端类型</th>
                <th>AppSecret</th>
                <th>当前版本</th>
                <th>发布时间</th>
                <th>状态</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mp in mpList" :key="mp.id">
                <td><b>{{ mp.name }}</b></td>
                <td class="col-mono">{{ mp.app_id }}</td>
                <td>
                  <span class="tag" :class="typeTagClass(mp.type)">{{ typeLabel(mp.type) }}</span>
                </td>
                <td class="col-mono">{{ mp.app_secret_masked }}</td>
                <td>{{ mp.version }}</td>
                <td>{{ mp.published_at }}</td>
                <td>
                  <span class="tag" :class="mp.status === 'active' ? 'success' : 'default'">
                    {{ mp.status === 'active' ? '运行中' : '已停用' }}
                  </span>
                </td>
                <td class="col-actions">
                  <button class="btn-link" @click="openEdit(mp)">编辑</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="showToast('版本管理 &middot; ' + mp.name)">版本</button>
                  <span class="divider">|</span>
                  <button class="btn-link danger" @click="toggleStatus(mp)">
                    {{ mp.status === 'active' ? '停用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 小程序详情卡片 -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      <div
        v-for="mp in mpList"
        :key="mp.id"
        class="card"
        style="cursor:pointer"
        @click="openEdit(mp)"
      >
        <div class="card-head">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">{{ typeIcon(mp.type) }}</span>
            <div>
              <div class="card-title" style="font-size:14px">{{ mp.name }}</div>
              <div style="font-size:11px;color:var(--ant-text-3)">{{ typeLabel(mp.type) }} &middot; v{{ mp.version }}</div>
            </div>
          </div>
        </div>
        <div class="card-body" style="padding:14px">
          <div style="font-size:12px;color:var(--ant-text-3);margin-bottom:4px">AppID</div>
          <div class="col-mono" style="font-size:13px">{{ mp.app_id }}</div>
          <div style="font-size:12px;color:var(--ant-text-3);margin:8px 0 4px">回调地址</div>
          <div class="col-mono" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ mp.callback_url }}</div>
          <div style="font-size:12px;color:var(--ant-text-3);margin:8px 0 4px">商户号</div>
          <div class="col-mono" style="font-size:13px">{{ mp.mch_id || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑 Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-mask open" @click.self="closeModal">
      <div class="modal">
        <div class="modal-head">
          <span>{{ showAddModal ? '添加小程序' : ('编辑小程序 &middot; ' + (editForm.name || '')) }}</span>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div style="max-width:720px">
            <div class="form-row">
              <div class="form-item">
                <label class="form-label required">小程序名称</label>
                <input class="input" v-model="editForm.name" placeholder="如：袁夫稻田&middot;客户端">
              </div>
              <div class="form-item">
                <label class="form-label required">端类型</label>
                <select class="select" v-model="editForm.type">
                  <option value="client">客户端 (C端用户)</option>
                  <option value="merchant">商户端 (商户管理/核销)</option>
                  <option value="admin">管理端 (园区管理)</option>
                </select>
                <div class="form-help">选择小程序的使用端类型，不同类型对应不同的功能模块与权限</div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label required">小程序 AppID</label>
                <input class="input" v-model="editForm.app_id" placeholder="wx...">
              </div>
              <div class="form-item">
                <label class="form-label required">小程序 AppSecret</label>
                <div style="display:flex;gap:8px">
                  <input class="input" :type="showSecret ? 'text' : 'password'" v-model="editForm.app_secret" style="flex:1" placeholder="留空则不修改">
                  <button class="btn" @click="showSecret = !showSecret">{{ showSecret ? '隐藏' : '查看' }}</button>
                </div>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">回调地址 (Webhook)</label>
              <input class="input" v-model="editForm.callback_url" placeholder="https://api.yuanfu-rice.com/wx/.../callback">
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">支付商户号</label>
                <input class="input" v-model="editForm.mch_id" placeholder="微信支付商户号">
              </div>
              <div class="form-item">
                <label class="form-label">版本号</label>
                <input class="input" v-model="editForm.version" placeholder="v1.0.0">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="saving">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'

interface MPItem {
  id: number
  name: string
  app_id: string
  app_secret_masked: string
  type: string
  callback_url: string
  mch_id: string
  version: string
  published_at: string
  status: string
}

const mpList = ref<MPItem[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showSecret = ref(false)
const saving = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  app_id: '',
  app_secret: '',
  type: 'client',
  callback_url: '',
  mch_id: '',
  version: '',
})

function typeTagClass(type: string): string {
  if (type === 'client') return 'processing'
  if (type === 'merchant') return 'purple'
  return 'cyan'
}

function typeLabel(type: string): string {
  if (type === 'client') return '客户端'
  if (type === 'merchant') return '商户端'
  return '管理端'
}

function typeIcon(type: string): string {
  if (type === 'client') return '🛒'
  if (type === 'merchant') return '🏪'
  return '⚙'
}

function openEdit(mp: MPItem) {
  editForm.id = mp.id
  editForm.name = mp.name
  editForm.app_id = mp.app_id
  editForm.app_secret = ''
  editForm.type = mp.type
  editForm.callback_url = mp.callback_url
  editForm.mch_id = mp.mch_id
  editForm.version = mp.version
  showEditModal.value = true
  showSecret.value = false
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
}

async function handleSave() {
  saving.value = true
  try {
    const payload: any = {
      app_id: editForm.app_id,
      callback_url: editForm.callback_url,
      version: editForm.version,
      type: editForm.type,
    }
    if (editForm.mch_id) payload.mch_id = editForm.mch_id
    if (editForm.app_secret.trim()) payload.app_secret = editForm.app_secret.trim()

    let res: any
    if (showAddModal.value) {
      payload.name = editForm.name
      res = await request.post('/settings/mp-config', payload)
    } else {
      res = await request.put(`/settings/mp-config/${editForm.id}`, payload)
    }
    if (res.code === 0) {
      showToast('保存成功')
      closeModal()
      fetchList()
    } else {
      showToast(res.message || '保存失败')
    }
  } catch {
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(mp: MPItem) {
  try {
    const newStatus = mp.status === 'active' ? 'disabled' : 'active'
    const res: any = await request.put(`/settings/mp-config/${mp.id}/status`, { status: newStatus })
    if (res.code === 0) {
      showToast(mp.status === 'active' ? `已停用 ${mp.name}` : `已启用 ${mp.name}`)
      fetchList()
    }
  } catch {
    showToast('操作失败')
  }
}

function showToast(msg: string) {
  // Use browser native toast or Element Plus fallback
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}

async function fetchList() {
  try {
    const res: any = await request.get('/settings/mp-config/list')
    if (res.code === 0) {
      mpList.value = res.data
    }
  } catch {
    // Fallback: may not have list endpoint yet
  }
}

onMounted(fetchList)
</script>
