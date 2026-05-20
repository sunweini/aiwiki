<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">角色权限管理</div>
      <div class="page-subtitle">基于 RBAC 模型，按"平台 / 园区 / 商户"三层粒度配置权限</div>
    </div>

    <!-- System Roles -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">系统角色</div>
        <button class="btn btn-primary btn-sm" @click="handleAddRole">+ 新增角色</button>
      </div>
      <div class="card-body tight">
        <div class="table-wrap">
          <table class="ant-table">
            <thead>
              <tr>
                <th>角色名称</th>
                <th>角色编码</th>
                <th>层级</th>
                <th>角色描述</th>
                <th>员工数</th>
                <th>创建时间</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in roles" :key="r.id || r.code">
                <td><b>{{ r.name }}</b></td>
                <td class="col-mono">{{ r.code }}</td>
                <td>
                  <span :class="['tag', layerTag(r.layer)]">{{ r.layer }}</span>
                </td>
                <td style="color:var(--ant-text-3);font-size:13px">{{ roleDescription(r.code) }}</td>
                <td>{{ roleEmployeeCount(r.code) }}</td>
                <td>{{ r.created_at || '2026-01-05' }}</td>
                <td class="col-actions">
                  <button class="btn-link" @click="openPermConfig(r)">配置权限</button>
                  <span class="divider">|</span>
                  <button class="btn-link" @click="handleEditRole(r)">编辑</button>
                  <template v-if="r.code !== 'ADMIN_PLATFORM' && r.code !== 'MEMBER'">
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleDeleteRole(r)">删除</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Permission Matrix -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">权限矩阵 · 全景视图</div>
        <div class="card-extra">✓ = 完全可见可操作 ｜ ◐ = 仅可见 ｜ — = 无权限</div>
      </div>
      <div class="card-body" style="padding:0;overflow-x:auto">
        <table class="perm-matrix">
          <thead>
            <tr>
              <th class="module">功能模块</th>
              <th v-for="r in roles" :key="r.code">{{ r.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in matrixRows" :key="idx">
              <td class="module">{{ row.module }}</td>
              <td v-for="r in roles" :key="r.code"
                :class="{ yes: row.perms[r.code] === 'yes', partial: row.perms[r.code] === 'partial', no: row.perms[r.code] === 'no' }">
                {{ row.perms[r.code] === 'yes' ? '✓' : row.perms[r.code] === 'partial' ? '◐' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Permission Config -->
    <div class="modal-mask" :class="{ open: showPermDialog }" @click.self="showPermDialog = false">
      <div class="modal" style="min-width:650px">
        <div class="modal-head">
          <span>配置权限 — {{ editingRole?.name }}</span>
          <button class="close-btn" @click="showPermDialog = false">x</button>
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:var(--ant-text-3);margin-bottom:14px">为该角色勾选可访问的功能模块及操作粒度</div>
          <div class="table-wrap">
            <table class="perm-matrix">
              <thead>
                <tr>
                  <th class="module">功能模块</th>
                  <th>可见</th>
                  <th>新增</th>
                  <th>修改</th>
                  <th>删除</th>
                  <th>导出</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="g in permGroups" :key="g.module">
                  <td class="module"><b>{{ moduleName(g.module) }}</b></td>
                  <td><input type="checkbox" v-if="hasAction(g, 'view')" :checked="checked(g, 'view')" @change="toggle(g, 'view', $event)"></td>
                  <td><input type="checkbox" v-if="hasAction(g, 'create')" :checked="checked(g, 'create')" @change="toggle(g, 'create', $event)"></td>
                  <td><input type="checkbox" v-if="hasAction(g, 'edit')" :checked="checked(g, 'edit')" @change="toggle(g, 'edit', $event)"></td>
                  <td><input type="checkbox" v-if="hasAction(g, 'delete')" :checked="checked(g, 'delete')" @change="toggle(g, 'delete', $event)"></td>
                  <td><input type="checkbox" v-if="hasAction(g, 'export')" :checked="checked(g, 'export')" @change="toggle(g, 'export', $event)"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showPermDialog = false">取消</button>
          <button class="btn btn-primary" @click="savePerms" :disabled="savingPerms">{{ savingPerms ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const roles = ref<any[]>([])
const permGroups = ref<any[]>([])
const showPermDialog = ref(false)
const editingRole = ref<any>(null)
const checkedPermIds = ref<number[]>([])
const loadingPerms = ref(false)
const savingPerms = ref(false)

const MOD_NAMES: Record<string, string> = {
  parks: '园区管理', shops: '店铺管理', users: '客户管理', orders: '订单管理',
  finance: '财务管理', employees: '员工管理', gates: '闸机管理', activities: '活动管理',
  meituan: '美团核销', douyin: '抖音核销', rbac: '权限管理', settings: '系统设置', logs: '操作日志',
}
function moduleName(m: string) { return MOD_NAMES[m] || m }

// Pre-defined matrix for overview display (from prototype pc-pages-3.js line 313-329)
const matrixRows = reactive<any[]>([])

function buildMatrix() {
  const codeOrder = ['ADMIN_PLATFORM', 'PLATFORM_OPER', 'PARK_ADMIN', 'PARK_MANAGER', 'SHOP_ADMIN', 'SHOP_CASHIER']
  const activeCodes = roles.value.map((r: any) => r.code)
  const defaultPerms: Record<string, string[]> = {
    ADMIN_PLATFORM: ['yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes','yes'],
    PLATFORM_OPER:  ['yes','no','partial','yes','partial','partial','no','no','yes','partial','no','partial','yes','no','no','yes'],
    PARK_ADMIN:     ['yes','no','yes','yes','partial','yes','yes','yes','yes','yes','yes','yes','yes','no','no','partial'],
    PARK_MANAGER:   ['yes','no','partial','yes','partial','partial','no','no','yes','no','no','partial','no','no','no','partial'],
    SHOP_ADMIN:     ['no','no','no','yes','partial','yes','yes','partial','partial','partial','partial','no','no','no','no','no'],
    SHOP_CASHIER:   ['no','no','no','no','no','no','yes','no','no','no','no','no','no','no','no','no'],
  }
  const rows = [
    '园区总览/数据看板', '园区管理 (增/删/改)', '店铺管理 (本园区)', '店铺管理 (本店)',
    '用户列表 / 充值记录', '订单管理', '核销操作', '退款审核',
    '销售/客流统计', '财务管理 / 提现', '员工管理', '闸机/人脸管理',
    '活动推送/审核', '数据迁移', '系统配置 / 角色权限', '操作日志',
  ]
  matrixRows.length = 0
  rows.forEach((module, i) => {
    const perms: Record<string, string> = {}
    activeCodes.forEach((code: string) => {
      const allPerms = defaultPerms[code]
      perms[code] = allPerms ? allPerms[i] : 'no'
    })
    matrixRows.push({ module, perms })
  })
}

function roleDescription(code: string): string {
  const map: Record<string, string> = {
    ADMIN_PLATFORM: '平台最高权限，所有功能可访问',
    PLATFORM_OPER: '查看所有园区数据 / 活动推送 / 系统配置',
    PARK_ADMIN: '本园区所有管理权限 (商户/用户/财务/统计)',
    PARK_MANAGER: '本园区经营数据查看 / 部分管理操作',
    SHOP_ADMIN: '本店铺经营管理 (商品/订单/对账)',
    SHOP_CASHIER: '本店铺收银 / 核销操作',
  }
  return map[code] || ''
}

function roleEmployeeCount(code: string): number {
  const map: Record<string, number> = {
    ADMIN_PLATFORM: 1, PARK_ADMIN: 2, SHOP_ADMIN: 2, SHOP_CASHIER: 1,
  }
  return map[code] ?? 0
}

function layerTag(layer: string): string {
  const map: Record<string, string> = { '总部': 'error', '园区': 'processing', '商户': 'cyan' }
  return map[layer] || 'default'
}

function hasAction(g: any, action: string) { return g.actions?.some((a: any) => a.action === action) }
function permId(g: any, action: string) { return g.actions?.find((a: any) => a.action === action)?.id || null }
function checked(g: any, action: string) { const id = permId(g, action); return id !== null && checkedPermIds.value.includes(id) }

function toggle(g: any, action: string, event: Event) {
  const id = permId(g, action)
  if (id === null) return
  const val = (event.target as HTMLInputElement).checked
  if (val) { if (!checkedPermIds.value.includes(id)) checkedPermIds.value.push(id) }
  else { checkedPermIds.value = checkedPermIds.value.filter((pid: number) => pid !== id) }
}

async function openPermConfig(role: any) {
  editingRole.value = role
  showPermDialog.value = true
  loadingPerms.value = true
  try {
    const [permRes, rolePermRes]: any[] = await Promise.all([
      request.get('/permissions'),
      request.get(`/permissions/roles/${role.id}`),
    ])
    if (permRes.code === 0) permGroups.value = permRes.data || []
    if (rolePermRes.code === 0) checkedPermIds.value = rolePermRes.data || []
  } catch { ElMessage.error('加载权限失败') }
  finally { loadingPerms.value = false }
}

async function savePerms() {
  savingPerms.value = true
  try {
    const res: any = await request.put(`/permissions/roles/${editingRole.value.id}`, { permission_ids: checkedPermIds.value })
    if (res.code === 0) { ElMessage.success('保存成功'); showPermDialog.value = false; buildMatrix() }
    else ElMessage.error(res.message || '保存失败')
  } catch { ElMessage.error('保存失败') }
  finally { savingPerms.value = false }
}

function handleAddRole() { ElMessage.info('新增角色功能开发中') }
function handleEditRole(row: any) { ElMessage.info('编辑角色: ' + row.name) }
async function handleDeleteRole(row: any) {
  try {
    const res: any = await request.delete(`/rbac/roles/${row.id}`)
    if (res.code === 0) { ElMessage.success('已删除'); await loadRoles(); buildMatrix() }
    else ElMessage.error(res.message || '删除失败')
  } catch { ElMessage.error('删除失败') }
}

async function loadRoles() {
  try {
    const roleRes: any = await request.get('/rbac/roles')
    if (roleRes.code === 0) roles.value = roleRes.data || []
  } catch { ElMessage.error('加载角色失败') }
}

onMounted(async () => {
  try {
    await loadRoles()
    const permRes: any = await request.get('/permissions')
    if (permRes.code === 0) permGroups.value = permRes.data || []
    buildMatrix()
  } catch { ElMessage.error('加载数据失败') }
})
</script>

<style scoped>
.perm-matrix {
  width: 100%; font-size: 13px; border-collapse: collapse;
}
.perm-matrix th, .perm-matrix td {
  border: 1px solid var(--ant-border-secondary);
  padding: 10px 12px; text-align: center;
}
.perm-matrix th {
  background: var(--ant-fill-quaternary);
  font-weight: 600; color: var(--ant-text-1);
}
.perm-matrix th.module, .perm-matrix td.module {
  text-align: left; background: var(--ant-fill-quaternary);
  font-weight: 500; min-width: 160px;
}
.perm-matrix .yes { color: var(--ant-success); font-weight: 600; }
.perm-matrix .no { color: var(--ant-text-disabled); }
.perm-matrix .partial { color: var(--ant-warning); }
</style>
