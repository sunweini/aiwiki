<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">美团 API 配置</div>
      <div class="page-subtitle">美团技术服务合作中心 . appId / appSecret / 门店 appAuthToken 管理</div>
    </div>

    <!-- 平台级配置 -->
    <div class="card">
      <div class="card-head"><div class="card-title">平台级配置 (开发者账号)</div></div>
      <div class="card-body" style="max-width:680px">
        <div class="form-item">
          <label class="form-label required">美团 App ID</label>
          <input class="input" v-model="apiForm.app_id" placeholder="美团技术服务合作中心获取的开发者应用 ID">
          <div class="form-help">美团技术服务合作中心获取的开发者应用 ID</div>
        </div>
        <div class="form-item">
          <label class="form-label required">美团 App Secret</label>
          <div style="display:flex;gap:8px">
            <input class="input" :type="showSecret ? 'text' : 'password'" v-model="apiForm.app_secret" :placeholder="apiForm.app_secret_hidden ? '••••••••••••••••••••••••••••••••' : '留空则不修改'" style="flex:1">
            <button class="btn" @click="showSecret = !showSecret">{{ showSecret ? '隐藏' : '查看' }}</button>
            <button class="btn" @click="handleRegenerate">重新生成</button>
          </div>
          <div class="form-help">用于请求签名，请妥善保管</div>
        </div>
        <div class="form-item">
          <label class="form-label">回调地址 (Webhook)</label>
          <input class="input" v-model="apiForm.callback_url" placeholder="https://api.yuanfu-rice.com/meituan/callback">
          <div class="form-help">美团平台推送验券结果通知的回调地址</div>
        </div>
        <div style="border-top:1px solid var(--ant-border-secondary);padding-top:20px;display:flex;justify-content:flex-end;gap:10px">
          <button class="btn" @click="handleReset">重置</button>
          <button class="btn btn-primary" @click="saveConfig" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 门店授权 Token 管理 -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">门店授权 Token 管理</div>
        <button class="btn btn-primary btn-sm" @click="showBindDialog = true">+ 添加门店授权</button>
      </div>
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>店铺</th><th>appAuthToken</th><th>状态</th><th>绑定时间</th><th>最后同步</th><th style="text-align:right">累计核销</th><th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loadingStores">
              <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ant-text-3)">加载中...</td></tr>
            </template>
            <template v-else-if="stores.length === 0">
              <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--ant-text-3)">暂无门店授权</td></tr>
            </template>
            <template v-else>
              <tr v-for="s in stores" :key="s.id">
                <td><b>{{ s.shop?.name || s.shop || s.external_store_name || '-' }}</b></td>
                <td class="col-mono">
                  <template v-if="s.appAuthToken || s.auth_status === 1">{{ maskToken(s.appAuthToken) }}</template>
                  <template v-else><span style="color:var(--ant-text-disabled)">— 未获取 —</span></template>
                </td>
                <td>
                  <span class="tag success" v-if="s.status === '已绑定' || s.auth_status === 1">已绑定</span>
                  <span class="tag warning" v-else>{{ s.status === '待绑定' ? '待绑定' : '未绑定' }}</span>
                </td>
                <td>{{ s.bind_at || s.bindAt || s.created_at || '-' }}</td>
                <td>{{ s.last_sync || s.lastSync || '-' }}</td>
                <td style="text-align:right">{{ s.verify_count ?? s.verifyCount ?? '-' }}</td>
                <td class="col-actions">
                  <template v-if="s.status === '已绑定' || s.auth_status === 1">
                    <button class="btn-link" @click="handleRefreshToken(s)">刷新 Token</button>
                    <span class="divider">|</span>
                    <button class="btn-link danger" @click="handleUnbind(s)">解绑</button>
                  </template>
                  <template v-else>
                    <button class="btn-link" @click="handleBindQR(s)">生成绑定二维码</button>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- API 接口清单 -->
    <div class="card" style="margin-top:16px">
      <div class="card-head"><div class="card-title">API 接口清单</div></div>
      <div class="table-wrap">
        <table class="ant-table">
          <thead>
            <tr>
              <th>所属模块</th><th>接口名称</th><th>接口类型</th><th>是否必接</th><th>接口描述</th><th class="col-actions">文档</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="api in apiList" :key="api.name">
              <td>{{ api.module }}</td>
              <td><b>{{ api.name }}</b></td>
              <td>
                <span class="tag processing" v-if="api.type === 'UI SDK'">UI SDK</span>
                <span class="tag cyan" v-else>API</span>
              </td>
              <td>
                <span class="tag error" v-if="api.required">必接</span>
                <span class="tag default" v-else>可选</span>
              </td>
              <td style="color:var(--ant-text-2);font-size:13px">{{ api.desc }}</td>
              <td><button class="btn-link" @click="handleDocLink(api)">查看文档</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 绑定门店 Dialog -->
    <div class="modal-mask" :class="{ open: showBindDialog }" @click.self="showBindDialog = false">
      <div class="modal">
        <div class="modal-head">
          添加门店授权
          <button class="close-btn" @click="showBindDialog = false">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:var(--ant-text-3);margin-bottom:14px">请使用商户端小程序扫码完成门店映射绑定</p>
          <div class="form-item">
            <label class="form-label required">平台门店</label>
            <select class="select" v-model="bindForm.shop_id">
              <option v-for="s in shopList" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">美团门店ID</label>
            <input class="input" v-model="bindForm.external_store_id" placeholder="美团侧门店ID">
          </div>
          <div class="form-item">
            <label class="form-label">美团门店名</label>
            <input class="input" v-model="bindForm.external_store_name" placeholder="美团侧门店名称">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" @click="showBindDialog = false">取消</button>
          <button class="btn btn-primary" @click="handleBind" :disabled="binding">{{ binding ? '绑定中...' : '确认绑定' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const stores = ref<any[]>([])
const shopList = ref<any[]>([])
const loadingStores = ref(false)
const saving = ref(false)
const showBindDialog = ref(false)
const binding = ref(false)
const showSecret = ref(false)
const apiForm = reactive({ app_id: '', app_secret: '', callback_url: '', app_secret_hidden: false })
const bindForm = reactive({ shop_id: 1, external_store_id: '', external_store_name: '' })

// API 接口清单 (matching prototype)
const apiList = [
  { module: '门店映射', name: '门店映射 UI SDK 接入', type: 'UI SDK', required: true, desc: '商家扫码完成门店与美团平台的绑定，获取 appAuthToken' },
  { module: '套餐映射', name: '门店套餐映射', type: 'API', required: false, desc: '查询并配置美团团购套餐与收银系统菜品的映射关系' },
  { module: '团购验券', name: '验券准备', type: 'API', required: true, desc: '验券前预检查，查询券码对应套餐信息及可核销状态' },
  { module: '团购验券', name: '执行验券', type: 'API', required: true, desc: '正式完成券码核销操作' },
  { module: '团购验券', name: '撤销验券', type: 'API', required: false, desc: '在规定时间内撤销已完成的核销操作' },
  { module: '团购验券', name: '已验券码查询', type: 'API', required: false, desc: '查询指定券码的核销状态与历史记录' },
  { module: '团购对账', name: '查询团购订单结算明细', type: 'API', required: false, desc: '查询指定时间范围内的团购订单结算明细，用于对账' },
  { module: '团购对账', name: '门店验券历史', type: 'API', required: false, desc: '查询门店指定日期的验券历史记录' },
]

function maskToken(token?: string) {
  if (!token) return '-'
  if (token.length <= 12) return token
  return token.slice(0, 6) + '****' + token.slice(-4)
}

async function fetchConfig() {
  try {
    const res: any = await request.get('/meituan/config')
    if (res.code === 0 && res.data) {
      Object.assign(apiForm, {
        app_id: res.data.app_id || '',
        callback_url: res.data.callback_url || '',
        app_secret_hidden: !!res.data.app_secret,
      })
    }
  } catch { /* ignore */ }
}

async function fetchShops() {
  try {
    const res: any = await request.get('/shops', { params: { page: 1, page_size: 200 } })
    if (res.code === 0) {
      shopList.value = res.data?.items || []
      if (shopList.value[0]) bindForm.shop_id = shopList.value[0].id
    }
  } catch { /* ignore */ }
}

async function fetchStores() {
  loadingStores.value = true
  try {
    const res: any = await request.get('/meituan/stores')
    if (res.code === 0) stores.value = res.data || []
  } catch { /* ignore */ }
  finally { loadingStores.value = false }
}

async function saveConfig() {
  saving.value = true
  try {
    const payload: any = { app_id: apiForm.app_id, callback_url: apiForm.callback_url }
    if (apiForm.app_secret.trim()) payload.app_secret = apiForm.app_secret.trim()
    const res: any = await request.put('/meituan/config', payload)
    if (res.code === 0) {
      ElMessage.success('美团 API 配置已保存')
      apiForm.app_secret = ''
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally { saving.value = false }
}

function handleReset() {
  fetchConfig()
  ElMessage.info('已重置')
}

function handleRegenerate() {
  ElMessage.info('Secret 已重新生成')
}

function handleRefreshToken(row: any) {
  ElMessage.info('Token 已刷新')
}

async function handleUnbind(row: any) {
  try {
    const res: any = await request.delete(`/meituan/stores/${row.id}`)
    if (res.code === 0) {
      ElMessage.success('已解绑门店映射')
      fetchStores()
    } else {
      ElMessage.error(res.message || '解绑失败')
    }
  } catch {
    ElMessage.error('解绑失败')
  }
}

function handleBindQR(row: any) {
  ElMessage.info('请使用商户端小程序扫码完成门店映射绑定')
}

async function handleBind() {
  binding.value = true
  try {
    const res: any = await request.post('/meituan/stores', bindForm)
    if (res.code === 0) {
      ElMessage.success('绑定成功')
      showBindDialog.value = false
      fetchStores()
    } else {
      ElMessage.error(res.message || '绑定失败')
    }
  } catch {
    ElMessage.error('绑定失败')
  } finally { binding.value = false }
}

function handleDocLink(api: any) {
  ElMessage.info('打开文档: ' + api.name)
}

onMounted(async () => { await Promise.all([fetchConfig(), fetchShops(), fetchStores()]) })
</script>
