<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">闸机管理</div>
      <div class="page-subtitle">管理园区闸机设备、人脸录入、进出记录</div>
    </div>

    <!-- Tab bar -->
    <div class="filter-bar" style="padding:8px 20px">
      <button :class="['btn btn-sm', activeTab === 'gate' ? 'btn-primary' : '']" @click="activeTab = 'gate'">闸机列表</button>
      <button :class="['btn btn-sm', activeTab === 'face' ? 'btn-primary' : '']" @click="activeTab = 'face'">人脸管理</button>
      <button :class="['btn btn-sm', activeTab === 'entry' ? 'btn-primary' : '']" @click="activeTab = 'entry'">进出记录</button>
    </div>

    <!-- ========== 闸机列表 ========== -->
    <template v-if="activeTab === 'gate'">
      <div class="filter-bar">
        <input class="input" v-model="gateFilters.keyword" placeholder="闸机名称 / SN" style="width:200px">
        <select class="select" v-model="gateFilters.status">
          <option>全部状态</option>
          <option value="1">在线</option>
          <option value="2">故障</option>
          <option value="0">离线</option>
        </select>
        <select class="select" v-model="gateFilters.direction">
          <option>全部方向</option>
          <option>进</option>
          <option>出</option>
        </select>
        <button class="btn btn-primary btn-sm" @click="fetchGates">查询</button>
        <div class="spacer"></div>
        <button class="btn btn-primary" @click="openGateAdd">+ 添加闸机</button>
      </div>

      <div class="card">
        <div class="card-body tight">
          <div class="table-wrap">
            <table class="ant-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>闸机名称</th>
                  <th>类型</th>
                  <th>方向</th>
                  <th>设备SN</th>
                  <th>启用状态</th>
                  <th>在线状态</th>
                  <th>今日通行</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(g, idx) in gates" :key="g.id">
                  <td>{{ idx + 1 }}</td>
                  <td><b>{{ g.name }}</b></td>
                  <td>
                    <span :class="['tag', g.type === '入口' || g.direction === '进' ? 'processing' : 'error']">{{ g.type || (g.direction === '进' ? '入口' : '出口') }}</span>
                  </td>
                  <td>{{ g.direction }}</td>
                  <td class="col-mono">{{ g.device_sn }}</td>
                  <td>
                    <span :class="['tag', g.status === 1 ? 'success' : 'default']">{{ g.status === 1 ? '启用' : '禁用' }}</span>
                  </td>
                  <td>
                    <span :class="['tag', g.online === 1 ? 'success' : 'default']">{{ g.online === 1 ? '在线' : '离线' }}</span>
                  </td>
                  <td>{{ g.today_pass || 0 }}</td>
                  <td class="col-actions">
                    <button class="btn-link" @click="handleRemoteOpen(g)" :disabled="g.status !== 1">远程开门</button>
                    <span class="divider">|</span>
                    <button class="btn-link" @click="openGateEdit(g)">编辑</button>
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleDeleteGate(g.id)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 人脸管理 ========== -->
    <template v-if="activeTab === 'face'">
      <div class="filter-bar">
        <input class="input" v-model="faceFilters.keyword" placeholder="手机号 / 用户ID" style="width:200px">
        <select class="select" v-model="faceFilters.status">
          <option>全部状态</option>
          <option value="1">已启用</option>
          <option value="0">已禁用</option>
        </select>
        <button class="btn btn-primary btn-sm" @click="fetchFaces">查询</button>
        <div class="spacer"></div>
        <button class="btn btn-primary" @click="openFaceAdd">+ 录入人脸</button>
      </div>

      <div class="card">
        <div class="card-body tight">
          <div class="table-wrap">
            <table class="ant-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>用户ID</th>
                  <th>手机号</th>
                  <th>人脸特征ID</th>
                  <th>授权闸机</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(f, idx) in faces" :key="f.id">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ f.user_id }}</td>
                  <td>{{ f.phone }}</td>
                  <td class="col-mono">{{ f.face_feature_id }}</td>
                  <td>{{ f.gate_scope || '全部' }}</td>
                  <td>
                    <span :class="['tag', f.status === 1 ? 'success' : 'default']">{{ f.status === 1 ? '启用' : '禁用' }}</span>
                  </td>
                  <td>{{ f.created_at }}</td>
                  <td class="col-actions">
                    <button class="btn-link" @click="handleConfigGate(f)">配置闸机</button>
                    <span class="divider">|</span>
                    <button class="btn-link" @click="handleViewFace(f)">查看</button>
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleDeleteFace(f.id)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== 进出记录 ========== -->
    <template v-if="activeTab === 'entry'">
      <div class="filter-bar">
        <select class="select" v-model="entryFilters.gate">
          <option>全部闸机</option>
        </select>
        <select class="select" v-model="entryFilters.direction">
          <option>进出方向</option>
          <option>进</option>
          <option>出</option>
        </select>
        <select class="select" v-model="entryFilters.verifyType">
          <option>验证方式</option>
          <option>人脸识别</option>
          <option>扫码通行</option>
          <option>远程开门</option>
        </select>
        <input class="input" v-model="entryFilters.keyword" placeholder="手机号 / 用户ID" style="width:180px">
        <input class="input" v-model="entryFilters.startTime" placeholder="开始时间" style="width:140px">
        <span>~</span>
        <input class="input" v-model="entryFilters.endTime" placeholder="结束时间" style="width:140px">
        <button class="btn btn-primary btn-sm" @click="fetchEntries">查询</button>
      </div>

      <div class="card">
        <div class="card-body tight">
          <div class="table-wrap">
            <table class="ant-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>用户ID</th>
                  <th>手机号</th>
                  <th>闸机</th>
                  <th>方向</th>
                  <th>特征ID</th>
                  <th>相似度</th>
                  <th>验证方式</th>
                  <th>进出时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, idx) in entries" :key="r.id">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ r.user_id || '-' }}</td>
                  <td>{{ r.phone || '-' }}</td>
                  <td>{{ r.gate_name }}</td>
                  <td>
                    <span :class="['tag', r.direction === '进' ? 'success' : 'warning']">{{ r.direction }}</span>
                  </td>
                  <td class="col-mono">{{ r.face_feature_id ? r.face_feature_id.substring(0, 10) + '...' : '-' }}</td>
                  <td>{{ r.similarity || '-' }}</td>
                  <td>
                    <span :class="['tag', verifyTypeTag(r.verify_type)]">{{ r.verify_type }}</span>
                  </td>
                  <td>{{ r.pass_time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span>共 {{ entryTotal }} 条</span>
            <button class="page-btn" :disabled="entryPage <= 1" @click="entryPage--; fetchEntries()">&lt;</button>
            <button v-for="p in entryVisiblePages" :key="p" class="page-btn" :class="{ active: p === entryPage }" @click="entryPage = p; fetchEntries()">{{ p }}</button>
            <button class="page-btn" :disabled="entryPage >= entryTotalPages" @click="entryPage++; fetchEntries()">&gt;</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: Gate Add/Edit -->
    <div class="modal-mask" :class="{ open: showGateDialog }" @click.self="showGateDialog = false">
      <div class="modal">
        <div class="modal-head">
          <span>{{ editingGateId ? '编辑闸机' : '添加闸机' }}</span>
          <button class="close-btn" @click="showGateDialog = false">x</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="form-label required">名称</label>
            <input class="input" v-model="gateForm.name" placeholder="如：主入口 1#">
          </div>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label required">类型</label>
              <input class="input" v-model="gateForm.type" placeholder="入口 / 出口">
            </div>
            <div class="form-item">
              <label class="form-label required">方向</label>
              <select class="select" v-model="gateForm.direction">
                <option>进</option>
                <option>出</option>
              </select>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">设备SN</label>
            <input class="input" v-model="gateForm.device_sn">
          </div>
          <div class="form-item">
            <label class="form-label">园区</label>
            <select class="select" v-model="gateForm.park_id">
              <option v-for="p in parkList" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showGateDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleGateSubmit" :disabled="gateSaving">{{ gateSaving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

// --- Tab state ---
const activeTab = ref<'gate' | 'face' | 'entry'>('gate')

// --- Gate list ---
const gates = ref<any[]>([])
const parkList = ref<any[]>([])
const showGateDialog = ref(false)
const editingGateId = ref<number | null>(null)
const gateSaving = ref(false)
const gateFilters = reactive({ keyword: '', status: '', direction: '' })
const gateForm = reactive({ name: '', type: '', direction: '进', device_sn: '', park_id: 1, status: 1 })

async function fetchParks() {
  try {
    const res: any = await request.get('/parks', { params: { page: 1, page_size: 50 } })
    if (res.code === 0) parkList.value = res.data?.items || []
  } catch { /* ignore */ }
}

async function fetchGates() {
  try {
    const params: any = { page: 1, page_size: 50 }
    if (gateFilters.status) params.status = gateFilters.status
    if (gateFilters.direction) params.direction = gateFilters.direction
    const res: any = await request.get('/gates', { params })
    if (res.code === 0) gates.value = res.data.items || res.data
  } catch { ElMessage.error('获取闸机列表失败') }
}

function openGateAdd() {
  editingGateId.value = null
  Object.assign(gateForm, { name: '', type: '', direction: '进', device_sn: '', park_id: parkList.value[0]?.id || 1, status: 1 })
  showGateDialog.value = true
}

function openGateEdit(row: any) {
  editingGateId.value = row.id
  Object.assign(gateForm, { name: row.name, type: row.type, direction: row.direction, device_sn: row.device_sn, park_id: row.park_id, status: row.status })
  showGateDialog.value = true
}

async function handleGateSubmit() {
  gateSaving.value = true
  try {
    let res: any
    if (editingGateId.value) {
      res = await request.put(`/gates/${editingGateId.value}`, gateForm)
    } else {
      res = await request.post('/gates', gateForm)
    }
    if (res.code === 0) { ElMessage.success('保存成功'); showGateDialog.value = false; fetchGates() }
    else ElMessage.error(res.message || '保存失败')
  } catch { ElMessage.error('保存失败') }
  finally { gateSaving.value = false }
}

async function handleDeleteGate(id: number) {
  try {
    const res: any = await request.delete(`/gates/${id}`)
    if (res.code === 0) { ElMessage.success('已删除'); fetchGates() }
    else ElMessage.error(res.message || '删除失败')
  } catch { ElMessage.error('删除失败') }
}

function handleRemoteOpen(row: any) {
  ElMessage.success('远程开门已执行: ' + row.name)
}

// --- Face list ---
const faces = ref<any[]>([])
const faceFilters = reactive({ keyword: '', status: '' })

async function fetchFaces() {
  try {
    const params: any = { page: 1, page_size: 50 }
    if (faceFilters.keyword) params.keyword = faceFilters.keyword
    if (faceFilters.status) params.status = faceFilters.status
    const res: any = await request.get('/face-records', { params })
    if (res.code === 0) faces.value = res.data.items || res.data
  } catch { ElMessage.error('获取人脸列表失败') }
}

function openFaceAdd() { ElMessage.info('录入人脸功能开发中') }
function handleConfigGate(row: any) { ElMessage.info('配置闸机: 用户 ' + row.user_id) }
function handleViewFace(row: any) { ElMessage.info('查看人脸: ' + row.face_feature_id) }
async function handleDeleteFace(id: number) {
  try {
    const res: any = await request.delete(`/face-records/${id}`)
    if (res.code === 0) { ElMessage.success('已删除'); fetchFaces() }
    else ElMessage.error(res.message || '删除失败')
  } catch { ElMessage.error('删除失败') }
}

// --- Entry records ---
const entries = ref<any[]>([])
const entryTotal = ref(0)
const entryPage = ref(1)
const entryPageSize = 20
const entryFilters = reactive({ gate: '', direction: '', verifyType: '', keyword: '', startTime: '', endTime: '' })

const entryTotalPages = computed(() => Math.max(1, Math.ceil(entryTotal.value / entryPageSize)))
const entryVisiblePages = computed(() => {
  const pages: number[] = []
  const tp = entryTotalPages.value
  const cur = entryPage.value
  for (let i = Math.max(1, cur - 2); i <= Math.min(tp, cur + 2); i++) pages.push(i)
  return pages
})

function verifyTypeTag(type: string): string {
  const map: Record<string, string> = { '人脸识别': 'processing', '扫码通行': 'cyan', '远程开门': 'warning' }
  return map[type] || 'default'
}

async function fetchEntries() {
  try {
    const params: any = { page: entryPage.value, page_size: entryPageSize }
    if (entryFilters.gate) params.gate_id = entryFilters.gate
    if (entryFilters.direction) params.direction = entryFilters.direction
    if (entryFilters.verifyType) params.verify_type = entryFilters.verifyType
    if (entryFilters.keyword) params.keyword = entryFilters.keyword
    if (entryFilters.startTime) params.start_time = entryFilters.startTime
    if (entryFilters.endTime) params.end_time = entryFilters.endTime
    const res: any = await request.get('/entry-records', { params })
    if (res.code === 0) { entries.value = res.data.items || res.data; entryTotal.value = res.data.total || entries.value.length }
  } catch { ElMessage.error('获取进出记录失败') }
}

onMounted(async () => {
  await fetchParks()
  await fetchGates()
  await fetchFaces()
  await fetchEntries()
})
</script>
